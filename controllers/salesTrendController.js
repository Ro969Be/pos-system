// ==========================================================
// backend/controllers/salesTrendController.js
// ==========================================================
// 売上トレンド分析用コントローラー
// ==========================================================

const Order = require("../models/Order");
const moment = require("moment");

// 全体サマリー
exports.getSummary = async (req, res) => {
  try {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "day").startOf("day");
    const weekAgo = moment().subtract(7, "days").startOf("day");

    const [todaySales, weekSales] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: today.toDate() } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: weekAgo.toDate() } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    res.json({
      today: todaySales[0]?.total || 0,
      week: weekSales[0]?.total || 0,
    });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ message: "売上集計エラー" });
  }
};

// 日別集計（全店舗）
exports.getDetailByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const start = moment(date).startOf("day").toDate();
    const end = moment(date).endOf("day").toDate();

    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$storeId", total: { $sum: "$totalPrice" } } },
    ]);

    res.json(sales);
  } catch (err) {
    console.error("getDetailByDate error:", err);
    res.status(500).json({ message: "日別集計エラー" });
  }
};

// 店舗別日別集計
exports.getDetailByStore = async (req, res) => {
  try {
    const { date, storeId } = req.params;
    const start = moment(date).startOf("day").toDate();
    const end = moment(date).endOf("day").toDate();

    const sales = await Order.aggregate([
      { $match: { storeId: storeId, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$storeId",
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(sales[0] || { total: 0, count: 0 });
  } catch (err) {
    console.error("getDetailByStore error:", err);
    res.status(500).json({ message: "店舗別日別集計エラー" });
  }
};
