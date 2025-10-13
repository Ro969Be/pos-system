// ==========================================================
// utils/receiptPdf.js
// ==========================================================
// 領収書PDF生成ユーティリティ（日本語フォント対応）
// ==========================================================

const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const fontPath = path.join(__dirname, "../fonts/NotoSansJP-Regular.ttf");

/**
 * 領収書PDFを生成してレスポンスに出力
 * @param {Object} res Express Response
 * @param {Object} data { store, order, setting, to, note }
 */
exports.generateReceiptPdf = (res, data) => {
  const { order, setting, to, note } = data;

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=receipt.pdf");

  doc.pipe(res);

  if (fs.existsSync(fontPath)) doc.font(fontPath);

  doc.fontSize(18).text("領 収 書", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(12).text(`宛名：${to || "御中"}`);
  doc.text(`金額：¥${order.totalPrice.toLocaleString()}-`);
  doc.moveDown();

  doc.text(note || setting.defaultNote);
  doc.moveDown();

  doc.text(`但し書き：${note || "飲食代として"}`);
  doc.moveDown();

  doc.text(`日付：${new Date(order.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  doc.text("―――――――――――――――――――――――――――");
  doc.text(`発行者：${setting.issuerName}`);
  if (setting.invoiceNumber) doc.text(`登録番号：${setting.invoiceNumber}`);
  if (setting.issuerAddress) doc.text(`住所：${setting.issuerAddress}`);
  if (setting.issuerTel) doc.text(`電話：${setting.issuerTel}`);
  doc.text("―――――――――――――――――――――――――――");
  doc.text(setting.issuerNote || "");

  doc.end();
};
