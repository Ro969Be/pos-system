// ==========================================================
// controllers/salesPaymentController.js
// ==========================================================
const Order = require("../models/Order");

// ----------------------------------------------------------
// 支払い方法別売上構成
// ----------------------------------------------------------
exports.getSalesByPayment = async (req, res) => {
  try {
    const { year } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const start = new Date(`${y}-01-01T00:00:00Z`);
    const end = new Date(`${y + 1}-01-01T00:00:00Z`);

    const pipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: "$payments" },
      {
        $group: {
          _id: "$payments.methodName", // methodName は PaymentMethod モデルに保存された決済名
          totalAmount: { $sum: "$payments.amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ];

    const result = await Order.aggregate(pipeline);
    const methods = result.map((r) => ({
      name: r._id || "その他",
      value: r.totalAmount,
    }));

    res.json({ year: y, methods });
  } catch (err) {
    console.error("getSalesByPayment error:", err);
    res.status(500).json({ message: err.message });
  }
};
