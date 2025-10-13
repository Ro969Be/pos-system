// ==========================================================
// controllers/salesCategoryController.js
// ==========================================================
const Order = require("../models/Order");
const Product = require("../models/Product");

// ----------------------------------------------------------
// カテゴリー別売上集計
// ----------------------------------------------------------
exports.getSalesByCategory = async (req, res) => {
  try {
    const { year } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const start = new Date(`${y}-01-01T00:00:00Z`);
    const end = new Date(`${y + 1}-01-01T00:00:00Z`);

    // Order→items→product.category で集計
    const pipeline = [
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSales: {
            $sum: { $multiply: ["$items.quantity", "$productInfo.price"] },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ];

    const result = await Order.aggregate(pipeline);
    const categories = result.map((r) => ({
      category: r._id || "未分類",
      totalSales: r.totalSales,
      orderCount: r.orderCount,
    }));

    res.json({ year: y, categories });
  } catch (err) {
    console.error("getSalesByCategory error:", err);
    res.status(500).json({ message: err.message });
  }
};
