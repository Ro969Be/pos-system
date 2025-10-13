// ==========================================================
// controllers/salesDashboardController.js
// ==========================================================
const Order = require("../models/Order");
const Product = require("../models/Product");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const fontPath = path.join(__dirname, "../fonts/NotoSansJP-Regular.ttf");

// ----------------------------------------------------------
// 共通：集計期間の作成（日／週／月）
// ----------------------------------------------------------
function buildDateRange(period, year, month) {
  const now = new Date();
  const y = parseInt(year) || now.getFullYear();
  const m = parseInt(month) ? parseInt(month) - 1 : now.getMonth();
  let start, end, groupBy;
  if (period === "daily") {
    start = new Date(y, m, 1);
    end = new Date(y, m + 1, 0, 23, 59, 59);
    groupBy = { $dayOfMonth: "$createdAt" };
  } else if (period === "weekly") {
    start = new Date(y, 0, 1);
    end = new Date(y + 1, 0, 0, 23, 59, 59);
    groupBy = { $week: "$createdAt" };
  } else {
    start = new Date(y, 0, 1);
    end = new Date(y + 1, 0, 0, 23, 59, 59);
    groupBy = { $month: "$createdAt" };
  }
  return { start, end, groupBy, y, m };
}

// ----------------------------------------------------------
// 売上推移（日／週／月）
// ----------------------------------------------------------
exports.getTrend = async (req, res) => {
  try {
    const { period = "daily", year, month, storeId } = req.query;
    const { start, end, groupBy } = buildDateRange(period, year, month);

    const match = { createdAt: { $gte: start, $lte: end } };
    if (storeId) match.storeId = storeId;

    const pipeline = [
      { $match: match },
      { $unwind: "$payments" },
      {
        $group: {
          _id: { period: groupBy },
          totalSales: { $sum: "$payments.amount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.period": 1 } },
    ];

    const result = await Order.aggregate(pipeline);
    res.json(
      result.map((r) => ({
        label: r._id.period,
        totalSales: r.totalSales,
        orderCount: r.orderCount,
        avg: r.orderCount > 0 ? Math.round(r.totalSales / r.orderCount) : 0,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// カテゴリー別売上（月単位）
// ----------------------------------------------------------
exports.getCategory = async (req, res) => {
  try {
    const { year, month, storeId } = req.query;
    const { start, end } = buildDateRange("daily", year, month);
    const match = { createdAt: { $gte: start, $lte: end } };
    if (storeId) match.storeId = storeId;

    const result = await Order.aggregate([
      { $match: match },
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
          qty: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.json(
      result.map((r) => ({
        category: r._id || "未分類",
        totalSales: r.totalSales,
        qty: r.qty,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// 支払い方法別構成
// ----------------------------------------------------------
exports.getPayment = async (req, res) => {
  try {
    const { year, month, storeId } = req.query;
    const { start, end } = buildDateRange("daily", year, month);
    const match = { createdAt: { $gte: start, $lte: end } };
    if (storeId) match.storeId = storeId;

    const result = await Order.aggregate([
      { $match: match },
      { $unwind: "$payments" },
      {
        $group: {
          _id: "$payments.methodName",
          total: { $sum: "$payments.amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(
      result.map((r) => ({
        name: r._id || "その他",
        value: r.total,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// 詳細（日付クリック）
// ----------------------------------------------------------
exports.getDetail = async (req, res) => {
  try {
    const { date, storeId } = req.params;
    const target = new Date(date);
    const start = new Date(target.setHours(0, 0, 0, 0));
    const end = new Date(target.setHours(23, 59, 59, 999));
    const match = { createdAt: { $gte: start, $lte: end } };
    if (storeId) match.storeId = storeId;

    const orders = await Order.find(match).populate("items.product");
    res.json(
      orders.map((o) => ({
        id: o._id,
        customer: o.customerName || "N/A",
        total: o.totalPrice,
        items: o.items.map((i) => ({
          name: i.product.name,
          qty: i.quantity,
          price: i.product.price,
        })),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
