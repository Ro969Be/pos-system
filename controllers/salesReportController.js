// ==========================================================
// controllers/salesReportController.js
// ==========================================================
// 売上分析レポート（期間・商品・支払い・割引・粗利）
// ==========================================================
const Order = require("../models/Order");
const Product = require("../models/Product");
const PaymentMethod = require("../models/PaymentMethod");
const { buildDateFilter } = require("../utils/dateFilter");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

// ====== 日本語フォント設定 ======
const fontPath = path.join(__dirname, "../fonts/NotoSansJP-Regular.ttf");
if (!fs.existsSync(fontPath)) {
  console.error("⚠️ 日本語フォントが見つかりません:", fontPath);
}

// ----------------------------------------------------------
// 集計ユーティリティ
// ----------------------------------------------------------
async function aggregateSales(storeId, match) {
  const orders = await Order.find({ storeId, ...match })
    .populate("items.product")
    .populate("payments.method");

  const summary = {
    totalSales: 0,
    itemCount: 0,
    orderCount: orders.length,
    customerCount: new Set(),
    payments: {},
    discounts: 0,
    costTotal: 0,
    returns: 0,
  };

  // 商品別集計
  const productStats = {};

  for (const order of orders) {
    summary.totalSales += order.totalPrice || 0;
    for (const i of order.items) {
      if (!i.product) continue;
      const pid = i.product._id.toString();
      if (!productStats[pid]) {
        productStats[pid] = {
          name: i.product.name,
          category: i.product.category || "未分類",
          taxRate: i.product.taxRate || 10,
          price: i.product.price,
          qty: 0,
          sales: 0,
          cost: 0,
        };
      }
      productStats[pid].qty += i.quantity;
      productStats[pid].sales += i.product.price * i.quantity;
      productStats[pid].cost += (i.product.cost || 0) * i.quantity;
      summary.itemCount += i.quantity;
      summary.costTotal += (i.product.cost || 0) * i.quantity;
    }

    // 支払い内訳
    for (const p of order.payments) {
      const name = p.method?.displayName || p.methodName || "不明";
      if (!summary.payments[name]) summary.payments[name] = 0;
      summary.payments[name] += p.amount || 0;
    }

    // 顧客数カウント
    if (order.customerPhone) summary.customerCount.add(order.customerPhone);
  }

  summary.customerCount = summary.customerCount.size;
  summary.profit = summary.totalSales - summary.costTotal;
  summary.profitRate =
    summary.totalSales > 0
      ? Math.round((summary.profit / summary.totalSales) * 100)
      : 0;

  return { summary, productStats };
}

// ----------------------------------------------------------
// JSON出力
// ----------------------------------------------------------
exports.getSalesSummary = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const match = buildDateFilter(period, startDate, endDate, "createdAt");
    const { summary, productStats } = await aggregateSales(req.storeId, match);
    res.json({ summary, productStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// CSV出力
// ----------------------------------------------------------
exports.getSalesCsv = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const match = buildDateFilter(period, startDate, endDate, "createdAt");
    const { summary, productStats } = await aggregateSales(req.storeId, match);

    const rows = Object.values(productStats).map((p) => ({
      商品名: p.name,
      カテゴリ: p.category,
      税区分: `${p.taxRate}%`,
      販売数: p.qty,
      販売額: p.sales,
      原価: p.cost,
      粗利: p.sales - p.cost,
      粗利率: Math.round(((p.sales - p.cost) / p.sales) * 100) + "%",
    }));

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment(`sales-${period || "custom"}.csv`);
    res.send("\uFEFF" + csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// PDF出力
// ----------------------------------------------------------
exports.getSalesPdf = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const match = buildDateFilter(period, startDate, endDate, "createdAt");
    const { summary, productStats } = await aggregateSales(req.storeId, match);

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales-${period || "custom"}.pdf`
    );
    doc.pipe(res);
    if (fs.existsSync(fontPath)) doc.font(fontPath);

    doc.fontSize(16).text("売上分析レポート", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`期間: ${period || `${startDate}～${endDate}`}`);
    doc.moveDown();

    // 基本情報
    doc.text(`売上合計: ¥${summary.totalSales.toLocaleString()}`);
    doc.text(
      `粗利合計: ¥${summary.profit.toLocaleString()} (${summary.profitRate}%)`
    );
    doc.text(`会計数: ${summary.orderCount}`);
    doc.text(`商品数: ${summary.itemCount}`);
    doc.text(`客数: ${summary.customerCount}`);
    doc.moveDown();

    doc.text("支払い方法別売上:");
    for (const [name, val] of Object.entries(summary.payments)) {
      doc.text(`  - ${name}: ¥${val.toLocaleString()}`);
    }

    doc.moveDown().text("商品別売上:");
    Object.values(productStats).forEach((p) => {
      doc.text(
        `  - ${p.name} (${p.category}) ... ¥${p.sales.toLocaleString()} / ${
          p.qty
        }個`
      );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
