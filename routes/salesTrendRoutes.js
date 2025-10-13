// ==========================================================
// backend/routes/salesTrendRoutes.js
// ==========================================================
// 売上推移・トレンド分析ルート
// ----------------------------------------------------------
//  GET /api/sales-trend/summary           → 全体集計
//  GET /api/sales-trend/detail/:date      → 日別集計（全店舗）
//  GET /api/sales-trend/detail/:date/:storeId → 店舗別日別集計
// ==========================================================

const express = require("express");
const router = express.Router();
const SalesTrendController = require("../controllers/salesTrendController");

// ==========================================================
// 全体サマリー
// ==========================================================
router.get("/summary", SalesTrendController.getSummary);

// ==========================================================
// 日別集計（全店舗）
// ==========================================================
router.get("/detail/:date", SalesTrendController.getDetailByDate);

// ==========================================================
// 店舗別日別集計（storeId指定）
// ==========================================================
router.get("/detail/:date/:storeId", SalesTrendController.getDetailByStore);

module.exports = router;
