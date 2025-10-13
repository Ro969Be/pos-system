// ==========================================================
// controllers/paymentController.js（修正版）
// ==========================================================
// 会計確定処理：過剰支払い対応（現金優先・お釣り自動算出）
// ==========================================================

const Order = require("../models/Order");
const Ticket = require("../models/Ticket");
const Customer = require("../models/Customer");

/**
 * 支払いバリデーションとお釣り処理
 */
function validateAndAdjustPayments(total, payments) {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const cash = payments.find(
    (p) => p.methodName === "現金" || p.methodName === "CASH"
  );
  const cashAmount = cash ? cash.amount : 0;
  const diff = totalPaid - total;

  // 不足
  if (diff < 0) {
    throw new Error("支払いが不足しています。");
  }

  // ちょうど
  if (diff === 0) {
    return { totalPaid, change: 0, payments };
  }

  // 過剰支払い
  if (diff > 0) {
    if (!cash) {
      throw new Error("現金が含まれていないため、過剰支払いはできません。");
    }

    if (diff > cashAmount) {
      throw new Error("現金額が過剰分をカバーできません（お釣り不足）。");
    }

    // 現金からお釣りを引く
    cash.amount = cashAmount - diff;
    return { totalPaid, change: diff, payments };
  }
}

exports.closeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payments } = req.body; // [{ methodName, methodId, amount }]

    const order = await Order.findById(orderId).populate("items.product");
    if (!order)
      return res.status(404).json({ message: "注文が見つかりません" });

    const total = order.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
    order.totalPrice = total;

    // バリデーション＆調整
    const { change, payments: adjusted } = validateAndAdjustPayments(
      total,
      payments
    );

    // 保存
    order.payments = adjusted.map((p) => ({
      method: p.methodId,
      methodName: p.methodName,
      amount: p.amount,
    }));
    order.status = "completed";
    order.change = change;
    await order.save();

    // チケット処理
    const ticket = new Ticket({
      order: order._id,
      storeId: order.storeId,
      status: "closed",
      tableNumber: order.tableNumber,
      staff: order.staff,
    });
    await ticket.save();

    // 顧客統計（既存処理）
    if (order.customer) {
      const customer = await Customer.findById(order.customer);
      if (customer) {
        customer.visitCount = (customer.visitCount || 0) + 1;
        customer.lastVisit = new Date();
        customer.visitHistory = [
          { date: new Date(), orderId: order._id, total },
          ...(customer.visitHistory || []),
        ].slice(0, 5);
        await customer.save();
      }
    }

    res.json({ message: "会計完了", order, change });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
