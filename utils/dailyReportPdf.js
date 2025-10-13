// ==========================================================
// utils/dailyReportPdf.js
// ==========================================================
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const fontPath = path.join(__dirname, "../fonts/NotoSansJP-Regular.ttf");

function sum(arr, f) {
  return arr.reduce((s, x) => s + f(x), 0);
}

exports.buildDailyPdf = (res, payload) => {
  const { dateStr, orders, attendances, session, paymentBreakdown } = payload;

  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=daily-${dateStr}.pdf`
  );
  doc.pipe(res);
  if (fs.existsSync(fontPath)) doc.font(fontPath);

  doc.fontSize(16).text(`日報（${dateStr}）`, { align: "center" });
  doc.moveDown();

  // 売上
  const totalSales = sum(orders, (o) => o.totalPrice || 0);
  doc.fontSize(12).text(`売上合計：¥${totalSales.toLocaleString()}`);
  doc.moveDown(0.5);
  doc.text("【決済内訳】");
  (paymentBreakdown || []).forEach((p) => {
    doc.text(
      `- ${p._id}: ¥${(p.total || 0).toLocaleString()}（件数: ${p.count || 0}）`
    );
  });

  doc.moveDown();

  // 勤怠
  const totalMinutes = sum(attendances, (a) => a.totalMinutes || 0);
  doc.text(`【勤怠】総労働分数：${totalMinutes} 分`);
  attendances.forEach((a) => {
    const hours = Math.floor((a.totalMinutes || 0) / 60);
    const mins = (a.totalMinutes || 0) % 60;
    doc.text(`- ${a.staffName}: ${hours}時間${mins}分`);
  });

  doc.moveDown();

  // レジ
  if (session) {
    doc.text("【レジ締め】");
    doc.text(`- 開始現金：¥${(session.openingCash || 0).toLocaleString()}`);
    doc.text(`- 期待現金：¥${(session.expectedCash || 0).toLocaleString()}`);
    doc.text(`- 実在現金：¥${(session.closingCash || 0).toLocaleString()}`);
    const overShort = session.overShort || 0;
    doc.text(`- 差異（over/short）：¥${overShort.toLocaleString()}`);
  } else {
    doc.text("【レジ締め】レジセッション未登録");
  }

  doc.end();
};
