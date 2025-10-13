// controllers/paymentController.js
// =========================================================
// 会計確定処理：合計金額再計算・顧客更新・領収書発行
// =========================================================
const Order = require("../models/Order");
const Ticket = require("../models/Ticket");

exports.closeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("items.product");
    if (!order)
      return res.status(404).json({ message: "注文が見つかりません" });

    // 合計計算
    let total = 0;
    for (const i of order.items) {
      total += i.product.price * i.quantity;
    }
    order.totalPrice = total;

    // 支払い合計チェック
    const paid = order.payments.reduce((s, p) => s + p.amount, 0);
    if (paid !== total) {
      return res.status(400).json({ message: "支払い合計が一致しません" });
    }

    order.status = "completed";
    await order.save();

    // Ticketに記録
    const ticket = new Ticket({
      order: order._id,
      tableNumber: order.tableNumber,
      staff: order.staff,
      status: "closed",
    });
    await ticket.save();

    res.json({ message: "会計完了", order, ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
