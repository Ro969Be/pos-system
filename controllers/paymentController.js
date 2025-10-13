// ==========================================================
// controllers/paymentController.js
// ==========================================================
// 会計処理：割引・税率・個別会計対応
// ==========================================================

const Order = require("../models/Order");
const Ticket = require("../models/Ticket");
const { applyDiscounts } = require("../utils/discountCalculator");
const Discount = require("../models/Discount");

// 会計確定
exports.closeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("discounts")
      .populate("items.discounts");
    if (!order)
      return res.status(404).json({ message: "注文が見つかりません" });

    // ✅ 割引適用
    let subtotal = 0;
    for (const i of order.items) {
      const base = i.product.price * i.quantity;
      const taxed = base * (1 + (i.taxRate || 10) / 100);
      const afterDiscount = applyDiscounts(taxed, i.discounts);
      subtotal += afterDiscount;
    }
    const total = applyDiscounts(subtotal, order.discounts);
    order.totalPrice = Math.round(total);

    // ✅ 個別支払いの整合性チェック
    if (order.splitPayments?.length > 0) {
      const splitSum = order.splitPayments.reduce((s, p) => s + p.amount, 0);
      if (splitSum !== order.totalPrice) {
        return res.status(400).json({ message: "個別会計合計が一致しません" });
      }
    }

    order.status = "completed";
    await order.save();

    // ✅ Ticket作成
    const ticket = new Ticket({
      order: order._id,
      storeId: order.storeId,
      status: "closed",
    });
    await ticket.save();

    res.json({ message: "会計完了", order, ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
