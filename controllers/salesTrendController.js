// ==========================================================
// controllers/salesTrendController.js
// ==========================================================
const Order = require("../models/Order");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

// 日本語フォント
const fontPath = path.join(__dirname, "../fonts/NotoSansJP-Regular.ttf");
if (!fs.existsSync(fontPath)) {
  console.warn("⚠️ 日本語フォントが見つかりません:", fontPath);
}

// ----------------------------------------------------------
// 売上集計共通関数
// ----------------------------------------------------------
async function aggregateSales({ year, month, storeId }) {
  const y = parseInt(year) || new Date().getFullYear();
  const m = parseInt(month) ? parseInt(month) - 1 : new Date().getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59);

  const match = { createdAt: { $gte: start, $lte: end } };
  if (storeId) match.storeId = storeId;

  const pipeline = [
    { $match: match },
    { $unwind: "$payments" },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          method: "$payments.methodName",
        },
        totalSales: { $sum: "$payments.amount" },
        orderCount: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.day",
        totalSales: { $sum: "$totalSales" },
        orderCount: { $sum: "$orderCount" },
        byMethod: { $push: { method: "$_id.method", amount: "$totalSales" } },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const result = await Order.aggregate(pipeline);

  return result.map((r) => ({
    date: `${y}/${m + 1}/${r._id}`,
    totalSales: r.totalSales,
    orderCount: r.orderCount,
    avg: r.orderCount > 0 ? Math.round(r.totalSales / r.orderCount) : 0,
    byMethod: r.byMethod,
  }));
}

// ----------------------------------------------------------
// API: 日別売上（JSON）
// ----------------------------------------------------------
exports.getSalesTrend = async (req, res) => {
  try {
    const { year, month, storeId } = req.query;
    const data = await aggregateSales({ year, month, storeId });
    res.json({ data, updatedAt: new Date() });
  } catch (err) {
    console.error("getSalesTrend error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// API: CSV出力
// ----------------------------------------------------------
exports.getSalesTrendCSV = async (req, res) => {
  try {
    const { year, month, storeId } = req.query;
    const data = await aggregateSales({ year, month, storeId });

    const csvData = data.map((r) => {
      const by = {};
      r.byMethod.forEach((m) => (by[m.method] = m.amount));
      return {
        日付: r.date,
        売上合計: r.totalSales,
        会計数: r.orderCount,
        平均単価: r.avg,
        現金: by["現金"] || 0,
        カード: by["カード"] || 0,
        PayPay: by["PayPay"] || 0,
        その他: Object.entries(by)
          .filter(([k]) => !["現金", "カード", "PayPay"].includes(k))
          .reduce((s, [, v]) => s + v, 0),
      };
    });

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`sales-${year}-${month || ""}.csv`);
    res.send("\uFEFF" + csv);
  } catch (err) {
    console.error("getSalesTrendCSV error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// API: PDF出力
// ----------------------------------------------------------
exports.getSalesTrendPDF = async (req, res) => {
  try {
    const { year, month, storeId } = req.query;
    const data = await aggregateSales({ year, month, storeId });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-${year}-${month}.pdf`
    );
    doc.pipe(res);

    if (fs.existsSync(fontPath)) doc.font(fontPath);
    doc
      .fontSize(18)
      .text(`売上レポート ${year}年${month}月`, { align: "center" });
    doc.moveDown(1);

    data.forEach((r) => {
      doc
        .fontSize(12)
        .text(
          `${r.date}：¥${r.totalSales.toLocaleString()}（会計数${
            r.orderCount
          }／単価¥${r.avg}）`
        );
    });

    doc.end();
  } catch (err) {
    console.error("getSalesTrendPDF error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// API: 日別詳細（伝票一覧）
// ----------------------------------------------------------
exports.getSalesDetail = async (req, res) => {
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
        table: o.tableNumber,
        total: o.totalPrice,
        status: o.status,
        items: o.items.map((i) => ({
          name: i.product.name,
          qty: i.quantity,
          price: i.product.price,
        })),
      }))
    );
  } catch (err) {
    console.error("getSalesDetail error:", err);
    res.status(500).json({ message: err.message });
  }
};
