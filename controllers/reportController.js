// ==========================================================
// controllers/reportController.js
// ==========================================================
// 日報（勤怠・売上・レジ差異）CSV/PDF
// ==========================================================
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit"); // 直接PDF生成もOKだが、ユーティリティに委譲
const path = require("path");
const fs = require("fs");
const Order = require("../models/Order");
const Attendance = require("../models/Attendance");
const CashSession = require("../models/CashSession");
const PaymentMethod = require("../models/PaymentMethod");
const mongoose = require("mongoose");
const { buildDailyPdf } = require("../utils/dailyReportPdf");

// 共通：日付レンジ
function dayRange(d) {
  const date = new Date(d);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
  return { start, end };
}

// JSON整形（売上：決済内訳）
async function salesBreakdown(storeId, start, end) {
  const pipeline = [
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(storeId),
        status: "completed",
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $unwind: "$payments" },
    {
      $lookup: {
        from: "paymentmethods",
        localField: "payments.method",
        foreignField: "_id",
        as: "methodInfo",
      },
    },
    {
      $addFields: {
        methodName: {
          $cond: [
            { $gt: [{ $size: "$methodInfo" }, 0] },
            { $arrayElemAt: ["$methodInfo.displayName", 0] },
            "$payments.methodName",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$methodName",
        total: { $sum: "$payments.amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ];
  return await Order.aggregate(pipeline);
}

// CSV出力
exports.dailyCsv = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const { start, end } = dayRange(dateStr);

    const orders = await Order.find({
      storeId: req.storeId,
      status: "completed",
      createdAt: { $gte: start, $lte: end },
    });
    const attendances = await Attendance.find({
      storeId: req.storeId,
      date: { $gte: start, $lte: end },
    });
    const session = await CashSession.findOne({
      storeId: req.storeId,
      businessDate: start,
    });
    const payments = await salesBreakdown(req.storeId, start, end);

    const fields = ["セクション", "項目", "値"];
    const rows = [];

    const salesTotal = orders.reduce((s, o) => s + o.totalPrice, 0);
    rows.push({ セクション: "売上", 項目: "売上合計", 値: salesTotal });
    payments.forEach((p) =>
      rows.push({ セクション: "売上内訳", 項目: p._id, 値: p.total })
    );

    const laborMin = attendances.reduce((s, a) => s + (a.totalMinutes || 0), 0);
    rows.push({ セクション: "勤怠", 項目: "総労働分数", 値: laborMin });

    if (session) {
      rows.push({
        セクション: "レジ",
        項目: "openingCash",
        値: session.openingCash,
      });
      rows.push({
        セクション: "レジ",
        項目: "cashSales(期待)",
        値: session.expectedCash - session.openingCash,
      });
      rows.push({
        セクション: "レジ",
        項目: "expectedCash",
        値: session.expectedCash,
      });
      rows.push({
        セクション: "レジ",
        項目: "closingCash",
        値: session.closingCash,
      });
      rows.push({
        セクション: "レジ",
        項目: "overShort",
        値: session.overShort,
      });
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`daily-${dateStr}.csv`);
    res.send("\uFEFF" + csv);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// PDF出力（ユーティリティに委譲）
exports.dailyPdf = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const { start, end } = dayRange(dateStr);

    const orders = await Order.find({
      storeId: req.storeId,
      status: "completed",
      createdAt: { $gte: start, $lte: end },
    }).populate("payments.method");
    const attendances = await Attendance.find({
      storeId: req.storeId,
      date: { $gte: start, $lte: end },
    });
    const session = await CashSession.findOne({
      storeId: req.storeId,
      businessDate: start,
    });
    const paymentBreakdown = await salesBreakdown(req.storeId, start, end);

    buildDailyPdf(res, {
      dateStr,
      orders,
      attendances,
      session,
      paymentBreakdown,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
