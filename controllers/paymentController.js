// controllers/paymentController.js
// =========================================================
// 会計確定処理：合計金額再計算・顧客更新・領収書発行
// =========================================================
const Order = require("../models/Order");
const Ticket = require("../models/Ticket");
const Customer = require("../models/Customer"); // 🔸 追記：顧客更新のため

exports.closeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("items.product");
    if (!order)
      return res.status(404).json({ message: "注文が見つかりません" });

    // 合計計算（既存）
    let total = 0;
    for (const i of order.items) {
      total += i.product.price * i.quantity;
    }
    order.totalPrice = total;

    // 支払い合計チェック（既存）
    const paid = order.payments.reduce((s, p) => s + p.amount, 0);
    if (paid !== total) {
      return res.status(400).json({ message: "支払い合計が一致しません" });
    }

    order.status = "completed";
    await order.save();

    // Ticketに記録（既存）
    const ticket = new Ticket({
      order: order._id,
      storeId: order.storeId, // 🔸 storeIdを明示
      tableNumber: order.tableNumber,
      staff: order.staff,
      status: "closed",
    });
    await ticket.save();

    // 🔸 追記: 顧客統計の更新 (#24要件)
    if (order.customer) {
      const customer = await Customer.findOne({
        _id: order.customer,
        storeId: order.storeId,
      });
      if (customer) {
        customer.visitCount = (customer.visitCount || 0) + 1;
        customer.lastVisit = new Date();

        // 直近履歴の先頭に追加（最大5件）
        const newEntry = {
          date: new Date(),
          orderId: order._id,
          total: order.totalPrice,
        };
        const history = [newEntry, ...(customer.visitHistory || [])].slice(
          0,
          5
        );
        customer.visitHistory = history;

        await customer.save();
      }
    }

    res.json({ message: "会計完了", order, ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
