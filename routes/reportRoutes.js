// routes/reportRoutes.js
const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  salesListCSV,
  salesListCSVRange,
  salesSummaryPDF,
  salesSummaryPDFRange,
} = require("../controllers/reportController");

const router = express.Router();

// 管理者のみアクセス可
router.use(protect, adminOnly);

// ------------------ CSV: 売上一覧 ------------------
router.get("/sales-list/:period", salesListCSV);   // 例: daily, monthly
router.get("/sales-list", salesListCSV);           // 全期間
router.get("/sales-list/range", salesListCSVRange); // 任意の日付範囲

// ------------------ PDF: 売上サマリー ------------------
router.get("/sales-summary/:period", salesSummaryPDF);    // daily / monthly
router.get("/sales-summary/range", salesSummaryPDFRange); // 日付範囲

module.exports = router;
