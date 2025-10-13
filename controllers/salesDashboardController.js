// ==========================================================
// backend/controllers/salesDashboardController.js
// ==========================================================
// 売上ダッシュボード用の集計処理
// ==========================================================

const Order = require("../models/Order");
const moment = require("moment");

// ----------------------------------------------------------
// 売上サマリー（週/月など）
// ----------------------------------------------------------
exports.getDashboardSummary = async (req, res) => {
  try {
    const now = moment();
    const startOfMonth = now.clone().startOf("month").toDate();
    const startOfWeek = now.clone().startOf("week").toDate();

    const [monthTotal, weekTotal, todayTotal] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.aggregate([
        {
          $match: { createdAt: { $gte: now.clone().startOf("day").toDate() } },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    res.json({
      today: todayTotal[0]?.total || 0,
      week: weekTotal[0]?.total || 0,
      month: monthTotal[0]?.total || 0,
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    res.status(500).json({ message: "サマリー取得エラー", error: err.message });
  }
};

// ----------------------------------------------------------
// 日別売上詳細（全店舗）
// ----------------------------------------------------------
exports.getDailyDetail = async (req, res) => {
  try {
    const { date } = req.params;
    const start = moment(date).startOf("day").toDate();
    const end = moment(date).endOf("day").toDate();

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$storeId",
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(result);
  } catch (err) {
    console.error("getDailyDetail error:", err);
    res.status(500).json({ message: "日別詳細取得エラー", error: err.message });
  }
};

// ----------------------------------------------------------
// 店舗別日別売上詳細
// ----------------------------------------------------------
exports.getStoreDailyDetail = async (req, res) => {
  try {
    const { date, storeId } = req.params;
    const start = moment(date).startOf("day").toDate();
    const end = moment(date).endOf("day").toDate();

    const result = await Order.aggregate([
      { $match: { storeId: storeId, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$storeId",
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(result[0] || { total: 0, count: 0 });
  } catch (err) {
    console.error("getStoreDailyDetail error:", err);
    res
      .status(500)
      .json({ message: "店舗別詳細取得エラー", error: err.message });
  }
};
