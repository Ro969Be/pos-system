// ==========================================================
// utils/generateReceiptPDF.js
// ==========================================================
// レシート / 領収書PDF生成ユーティリティ
// - 店舗情報・宛名・但し書き・金額・インボイス番号対応
// - PDFKit + 日本語フォント NotoSansJP を使用
// ==========================================================

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ✅ 日本語フォントパス
const fontPath = path.join(__dirname, "../fonts/NotoSansJP-Regular.ttf");

// ----------------------------------------------------------
// PDF生成関数
// ----------------------------------------------------------
async function generateReceiptPDF(ticket, order, store, res) {
  // A5サイズ: レシートに最適
  const doc = new PDFDocument({ margin: 40, size: "A5" });

  // PDFレスポンスヘッダー設定
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=receipt-${ticket._id}.pdf`
  );

  // 出力ストリームをレスポンスに接続
  doc.pipe(res);

  // ✅ フォント設定
  if (fs.existsSync(fontPath)) {
    doc.font(fontPath);
  }

  // -------------------------------
  // ヘッダー部分
  // -------------------------------
  doc.fontSize(18).text(store.name || "店舗名未登録", { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .text(`発行日: ${new Date(ticket.issueDate).toLocaleString()}`);
  doc.text(`レシートNo: ${ticket._id}`);
  if (ticket.invoiceNumber) doc.text(`登録番号: ${ticket.invoiceNumber}`);

  doc.moveDown(0.8);
  doc.fontSize(12).text("領収書", { align: "center" });
  doc.moveDown(0.5);

  // -------------------------------
  // 宛名・但し書き欄
  // -------------------------------
  if (ticket.receiptName) {
    doc.text(`宛名: ${ticket.receiptName}`);
  }
  if (ticket.receiptNote) {
    doc.text(`但し書き: ${ticket.receiptNote}`);
  }

  doc.moveDown(1);

  // -------------------------------
  // 商品明細リスト
  // -------------------------------
  doc.fontSize(11).text("【明細】");
  doc.moveDown(0.3);

  let total = 0;
  for (const item of order.items) {
    const productName = item.product?.name || "不明商品";
    const unitPrice = item.product?.price || 0;
    const lineTotal = unitPrice * item.quantity;
    total += lineTotal;
    doc.text(
      `${productName} × ${item.quantity} …… ¥${lineTotal.toLocaleString()}`
    );
  }

  doc.moveDown(0.5);
  doc.text(`合計金額: ¥${total.toLocaleString()}`, { align: "right" });
  doc.moveDown(0.5);
  doc.text("ありがとうございました。", { align: "center" });

  doc.end();
}

module.exports = generateReceiptPDF;
