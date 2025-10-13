// ==========================================================
// backend/controllers/reportController.js
// ==========================================================
// 売上レポート・CSV / PDF出力処理
// ----------------------------------------------------------
// CommonJS対応・日本語フォント対応
// ==========================================================

const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const Order = require("../models/Order");
const PaymentMethod = require("../models/PaymentMethod");

// ====== 日本語フォント設定 ======
const fontPath = path.join(__dirname, "../fonts/NotoSansJP-Regular.ttf");
if (!fs.existsSync(fontPath)) {
  console.warn("⚠️ 日本語フォントが見つかりません:", fontPath);
}

// ====== 日付フィルタ ======
function buildDateFilter(
  period,
  startDate,
  endDate,
  field = "reservationDate"
) {
  const match = {};
  if (period === "daily") {
    match[field] = {
      $gte: moment().startOf("day").toDate(),
      $lte: moment().endOf("day").toDate(),
    };
  } else if (period === "monthly") {
    match[field] = {
      $gte: moment().startOf("month").toDate(),
      $lte: moment().endOf("month").toDate(),
    };
  } else if (startDate && endDate) {
    match[field] = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  return match;
}

// ====== CSV出力（日/月） ======
const salesListCSV = async (req, res) => {
  try {
    const period = req.params.period || null;
    const match = buildDateFilter(period);

    const orders = await Order.find(match)
      .populate("items.product")
      .populate("payments.method");

    const fields = ["日付", "顧客名", "商品", "ステータス", "支払い内訳"];
    const data = orders.map((o) => ({
      日付: o.createdAt.toISOString().split("T")[0],
      顧客名: o.customerName || "N/A",
      商品: o.items.map((i) => i.product?.name || "").join(", "),
      ステータス: o.status,
      支払い内訳: o.payments
        .map((p) => `${p.method?.displayName || "不明"}: ¥${p.amount}`)
        .join(", "),
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`sales-list-${period || "all"}.csv`);
    res.send("\uFEFF" + csv);
  } catch (err) {
    console.error("salesListCSV error:", err);
    res.status(500).json({ message: "CSV出力エラー", error: err.message });
  }
};

// ====== PDF出力（日/月） ======
const salesSummaryPDF = async (req, res) => {
  try {
    const period = req.params.period;
    const match = buildDateFilter(period);

    const summary = await Order.aggregate([
      { $match: match },
      { $unwind: "$payments" },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "payments.method",
          foreignField: "_id",
          as: "methodInfo",
        },
      },
      { $unwind: "$methodInfo" },
      {
        $group: {
          _id: { method: "$methodInfo.displayName" },
          total: { $sum: "$payments.amount" },
        },
      },
    ]);

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-summary-${period}.pdf`
    );
    doc.pipe(res);

    if (fs.existsSync(fontPath)) doc.font(fontPath);
    doc
      .fontSize(18)
      .text(`売上サマリー (${period})`, { align: "center" })
      .moveDown();

    summary.forEach((s) => {
      doc.fontSize(12).text(`${s._id.method}: ¥${s.total.toLocaleString()}`);
    });

    doc.end();
  } catch (err) {
    console.error("salesSummaryPDF error:", err);
    res.status(500).json({ message: "PDF出力エラー", error: err.message });
  }
};

// ====== CSV出力（期間指定） ======
const salesListCSVRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = buildDateFilter(null, startDate, endDate);

    const orders = await Order.find(match)
      .populate("items.product")
      .populate("payments.method");

    const fields = ["日付", "顧客名", "商品", "ステータス", "支払い内訳"];
    const data = orders.map((o) => ({
      日付: o.createdAt.toISOString().split("T")[0],
      顧客名: o.customerName || "N/A",
      商品: o.items.map((i) => i.product?.name || "").join(", "),
      ステータス: o.status,
      支払い内訳: o.payments
        .map((p) => `${p.method?.displayName || "不明"}: ¥${p.amount}`)
        .join(", "),
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`sales-list-${startDate}_${endDate}.csv`);
    res.send("\uFEFF" + csv);
  } catch (err) {
    console.error("salesListCSVRange error:", err);
    res.status(500).json({ message: "CSV出力エラー", error: err.message });
  }
};

// ====== PDF出力（期間指定） ======
const salesSummaryPDFRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = buildDateFilter(null, startDate, endDate);

    const summary = await Order.aggregate([
      { $match: match },
      { $unwind: "$payments" },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "payments.method",
          foreignField: "_id",
          as: "methodInfo",
        },
      },
      { $unwind: "$methodInfo" },
      {
        $group: {
          _id: { method: "$methodInfo.displayName" },
          total: { $sum: "$payments.amount" },
        },
      },
    ]);

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-summary-${startDate}_${endDate}.pdf`
    );
    doc.pipe(res);

    if (fs.existsSync(fontPath)) doc.font(fontPath);
    doc
      .fontSize(18)
      .text(`売上サマリー (${startDate} ~ ${endDate})`, { align: "center" })
      .moveDown();

    summary.forEach((s) => {
      doc.fontSize(12).text(`${s._id.method}: ¥${s.total.toLocaleString()}`);
    });

    doc.end();
  } catch (err) {
    console.error("salesSummaryPDFRange error:", err);
    res.status(500).json({ message: "PDF出力エラー", error: err.message });
  }
};

// ==========================================================
// モジュールエクスポート
// ==========================================================
module.exports = {
  salesListCSV,
  salesSummaryPDF,
  salesListCSVRange,
  salesSummaryPDFRange,
};
