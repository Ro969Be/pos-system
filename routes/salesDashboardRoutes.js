// ==========================================================
// backend/routes/salesDashboardRoutes.js
// ==========================================================
// 売上ダッシュボード関連ルート
// ----------------------------------------------------------
// /api/sales-dashboard/summary              → 売上サマリー
// /api/sales-dashboard/detail/:date         → 日別売上詳細
// /api/sales-dashboard/detail/:date/:storeId → 店舗別詳細
// ==========================================================

const express = require("express");
const router = express.Router();
const salesDashboardController = require("../controllers/salesDashboardController");

// 売上サマリー（全期間 or 現在期間）
router.get("/summary", salesDashboardController.getDashboardSummary);

// 日別詳細（全店舗）
router.get("/detail/:date", salesDashboardController.getDailyDetail);

// 店舗別日別詳細
router.get(
  "/detail/:date/:storeId",
  salesDashboardController.getStoreDailyDetail
);

module.exports = router;
