// ==========================================================
// backend/routes/reportRoutes.js
// ==========================================================
// 売上レポートルート
// ----------------------------------------------------------
// /api/reports/sales/csv/:period       CSV出力（日/月）
// /api/reports/sales/pdf/:period       PDF出力（日/月）
// /api/reports/sales/csv-range         CSV出力（期間指定）
// /api/reports/sales/pdf-range         PDF出力（期間指定）
// ==========================================================

const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// CSV（日/月）
router.get("/sales/csv/:period", reportController.salesListCSV);

// PDF（日/月）
router.get("/sales/pdf/:period", reportController.salesSummaryPDF);

// CSV（期間指定）
router.get("/sales/csv-range", reportController.salesListCSVRange);

// PDF（期間指定）
router.get("/sales/pdf-range", reportController.salesSummaryPDFRange);

module.exports = router;
