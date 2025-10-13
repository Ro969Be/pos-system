// ==========================================================
// controllers/paymentController.js
// ==========================================================
// 会計確定処理：複数決済・領収書発行対応
// ==========================================================

const Order = require("../models/Order");
const Ticket = require("../models/Ticket");
const Customer = require("../models/Customer");
const PaymentMethod = require("../models/PaymentMethod");
const { generateReceiptPdf } = require("../utils/receiptPdf");

// 会計確定
exports.closeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payments } = req.body; // [{ methodId, amount }]

    const order = await Order.findById(orderId).populate("items.product");
    if (!order)
      return res.status(404).json({ message: "注文が見つかりません" });

    // 合計計算
    const total = order.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
    order.totalPrice = total;

    // 支払いチェック
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaid - total) > 1) {
      return res.status(400).json({ message: "支払い合計が一致しません" });
    }

    // 支払いを保存
    order.payments = payments.map((p) => ({
      method: p.methodId,
      amount: p.amount,
    }));
    order.status = "completed";
    await order.save();

    // チケット更新
    const ticket = new Ticket({
      order: order._id,
      storeId: order.storeId,
      status: "closed",
      tableNumber: order.tableNumber,
      staff: order.staff,
    });
    await ticket.save();

    // 顧客統計更新（既存）
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

    res.json({ message: "会計完了", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 決済方法一覧
exports.getPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({
      storeId: req.storeId,
      active: true,
    }).sort({ sortOrder: 1 });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 領収書PDF出力
exports.generateReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { to, note } = req.body;
    const order = await Order.findById(orderId).populate(
      "items.product payments.method"
    );
    if (!order)
      return res.status(404).json({ message: "注文が見つかりません" });

    const setting = await require("../models/ReceiptSetting").findOne({
      storeId: order.storeId,
    });
    if (!setting)
      return res.status(404).json({ message: "領収書設定が見つかりません" });

    generateReceiptPdf(res, { order, setting, to, note });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
