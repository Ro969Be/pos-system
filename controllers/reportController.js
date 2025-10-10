// reportController.js

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
  console.error("⚠️ 日本語フォントが見つかりません:", fontPath);
}

// ====== 日付フィルタユーティリティ ======
function buildDateFilter(period, startDate, endDate, field = "reservationDate") {
  const match = {};
  if (period === "daily") {
    match[field] = {
      $gte: moment().startOf("day").toDate(),
      $lte: moment().endOf("day").toDate()
    };
  } else if (period === "monthly") {
    match[field] = {
      $gte: moment().startOf("month").toDate(),
      $lte: moment().endOf("month").toDate()
    };
  } else if (startDate && endDate) {
    match[field] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  return match;
}

// ====== CSV出力: 売上一覧 ======
const salesListCSV = async (req, res) => {
  try {
    const period = req.params.period || null;
    const match = buildDateFilter(period);

    const orders = await Order.find(match)
      .populate("items.product")
      .populate("payments.method");

    const fields = ["日付", "顧客名", "商品", "ステータス", "支払い内訳"];
    const data = orders.map(o => ({
      "日付":
        o.reservationDate?.toISOString().split("T")[0] ||
        o.createdAt.toISOString().split("T")[0],
      "顧客名": o.customerName || "N/A",
      "商品": o.items.map(i => i.product?.name || "").join(", "),
      "ステータス": o.status,
      "支払い内訳": o.payments
        .map(p => `${p.method?.displayName || "不明"}: ¥${p.amount}`)
        .join(", ")
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`sales-list-${period || "all"}.csv`);
    res.send("\uFEFF" + csv); // BOM付きUTF-8
  } catch (err) {
    console.error("salesListCSV error:", err);
    res.status(500).json({ message: "CSV出力エラー" });
  }
};

// ====== CSV出力: 期間指定 ======
const salesListCSVRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = buildDateFilter(null, startDate, endDate);

    const orders = await Order.find(match)
      .populate("items.product")
      .populate("payments.method");

    const fields = ["日付", "顧客名", "商品", "ステータス", "支払い内訳"];
    const data = orders.map(o => ({
      "日付":
        o.reservationDate?.toISOString().split("T")[0] ||
        o.createdAt.toISOString().split("T")[0],
      "顧客名": o.customerName || "N/A",
      "商品": o.items.map(i => i.product?.name || "").join(", "),
      "ステータス": o.status,
      "支払い内訳": o.payments
        .map(p => `${p.method?.displayName || "不明"}: ¥${p.amount}`)
        .join(", ")
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`sales-list-${startDate}_${endDate}.csv`);
    res.send("\uFEFF" + csv);
  } catch (err) {
    console.error("salesListCSVRange error:", err);
    res.status(500).json({ message: "CSV出力エラー" });
  }
};

// ====== PDF出力: 売上サマリー（日/月単位） ======
const salesSummaryPDF = async (req, res) => {
  try {
    const period = req.params.period; // "daily" or "monthly"
    const match = buildDateFilter(period);

    const groupBy =
      period === "monthly"
        ? { $dateToString: { format: "%Y-%m", date: "$reservationDate" } }
        : { $dateToString: { format: "%Y-%m-%d", date: "$reservationDate" } };

    const summary = await Order.aggregate([
      { $match: match },
      { $unwind: "$payments" },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "payments.method",
          foreignField: "_id",
          as: "methodInfo"
        }
      },
      { $unwind: "$methodInfo" },
      {
        $group: {
          _id: { period: groupBy, method: "$methodInfo.displayName" },
          totalAmount: { $sum: "$payments.amount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.period": 1, "_id.method": 1 } }
    ]);

    // ✅ PDF生成
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=sales-summary-${period}.pdf`);
    doc.pipe(res);

    if (fs.existsSync(fontPath)) {
      doc.font(fontPath);
    }

    doc.fontSize(18).text(`売上サマリー (${period})`, { align: "center" });
    doc.moveDown();

    let currentPeriod = null;
    summary.forEach(item => {
      if (currentPeriod !== item._id.period) {
        doc.moveDown();
        doc.fontSize(14).text(`期間: ${item._id.period}`);
        currentPeriod = item._id.period;
      }
      doc.fontSize(12).text(
        `　- ${item._id.method}: ¥${item.totalAmount} （件数: ${item.orderCount}）`
      );
    });

    doc.end();
  } catch (err) {
    console.error("salesSummaryPDF error:", err);
    res.status(500).json({ message: "PDF出力エラー" });
  }
};

// ====== PDF出力: 期間指定 ======
const salesSummaryPDFRange = async (req, res) => {
  try {
    const { startDate, endDate, unit } = req.query; // unit="daily" or "monthly"
    const match = buildDateFilter(null, startDate, endDate);

    const groupBy =
      unit === "monthly"
        ? { $dateToString: { format: "%Y-%m", date: "$reservationDate" } }
        : { $dateToString: { format: "%Y-%m-%d", date: "$reservationDate" } };

    const summary = await Order.aggregate([
      { $match: match },
      { $unwind: "$payments" },
      {
        $lookup: {
          from: "paymentmethods",
          localField: "payments.method",
          foreignField: "_id",
          as: "methodInfo"
        }
      },
      { $unwind: "$methodInfo" },
      {
        $group: {
          _id: { period: groupBy, method: "$methodInfo.displayName" },
          totalAmount: { $sum: "$payments.amount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id.period": 1, "_id.method": 1 } }
    ]);

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition",
      `attachment; filename=sales-summary-${startDate}_${endDate}.pdf`
    );
    doc.pipe(res);

    if (fs.existsSync(fontPath)) {
      doc.font(fontPath);
    }

    doc.fontSize(18).text(`売上サマリー (${startDate} ~ ${endDate})`, { align: "center" });
    doc.moveDown();

    let currentPeriod = null;
    summary.forEach(item => {
      if (currentPeriod !== item._id.period) {
        doc.moveDown();
        doc.fontSize(14).text(`期間: ${item._id.period}`);
        currentPeriod = item._id.period;
      }
      doc.fontSize(12).text(
        `　- ${item._id.method}: ¥${item.totalAmount} （件数: ${item.orderCount}）`
      );
    });

    doc.end();
  } catch (err) {
    console.error("salesSummaryPDFRange error:", err);
    res.status(500).json({ message: "PDF出力エラー" });
  }
};

module.exports = {
  salesListCSV,
  salesSummaryPDF,
  salesListCSVRange,
  salesSummaryPDFRange
};
