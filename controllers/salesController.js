// ==========================================================
// controllers/salesController.js
// ==========================================================
// 売上集計コントローラ
// - 期間別集計（日/週/月/年）
// - 商品別・カテゴリー別集計
// - 今日の売上合計
// ==========================================================

const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// 共通：期間条件を生成
function buildDateRange(period) {
  const now = new Date();
  let start, end;

  switch (period) {
    case "day":
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "week":
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - now.getDay());
      start = new Date(firstDay.setHours(0, 0, 0, 0));
      end = new Date();
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    default:
      start = new Date(0);
      end = new Date();
  }
  return { start, end };
}

// ==========================================================
// 1️⃣ 今日の売上合計
// ==========================================================
exports.getTodaySales = async (req, res) => {
  try {
    const { start, end } = buildDateRange("day");
    const orders = await Order.find({
      storeId: req.storeId,
      status: "completed",
      createdAt: { $gte: start, $lte: end },
    });

    const total = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const count = orders.length;

    res.json({ date: start.toISOString().slice(0, 10), total, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================================
// 2️⃣ 期間別売上推移（日/週/月/年）
// ==========================================================
exports.getSalesByPeriod = async (req, res) => {
  try {
    const period = req.query.period || "day";
    const { start, end } = buildDateRange(period);

    // MongoDBのgroupで集計
    const data = await Order.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(req.storeId),
          status: "completed",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================================
// 3️⃣ 商品別／カテゴリー別集計
// ==========================================================
exports.getSalesByProduct = async (req, res) => {
  try {
    const { start, end } = buildDateRange(req.query.period || "month");
    const data = await Order.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(req.storeId),
          status: "completed",
          createdAt: { $gte: start, $lte: end },
        },
      },
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
          _id: "$productInfo.name",
          totalSales: {
            $sum: { $multiply: ["$items.quantity", "$productInfo.price"] },
          },
          count: { $sum: "$items.quantity" },
          category: { $first: "$productInfo.category" },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
