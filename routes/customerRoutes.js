// ==========================================================
// backend/routes/customerRoutes.js
// ==========================================================
// 顧客ルート（CommonJS構成）
// ----------------------------------------------------------
// ✅ 顧客一覧・詳細・登録・更新・削除APIを定義（既存）
// ✅ 追加: 電話番号検索 / 直近5回履歴 / メモ追記 / ポイント加減算
// ✅ JWT認証 + 店舗スコープ(storeContext) 必須
// ----------------------------------------------------------
// 権限制御（例）:
//   - admin, manager, store_admin      → 全権限
//   - store_staff                      → 閲覧のみ
//   - staff                            → アクセス不可
// ==========================================================

const express = require("express");
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchByPhone,
  getRecentHistory,
  appendMemo,
  updatePoints,
} = require("../controllers/customerController");

const auth = require("../middleware/authMiddleware");
const storeContext = require("../middleware/storeContextMiddleware");
// 役割ミドルウェアがある場合は使用（なければコメントアウトのままでOK）
// const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================================
// 全ルート共通: 認証 + 店舗スコープ
// ==========================================================
router.use(auth, storeContext);

// ==========================================================
// 📋 顧客一覧取得（GET /api/customers）
// ==========================================================
router.get(
  "/",
  /* authorizeRoles("admin","manager","store_admin","store_staff"), */ getCustomers
);

// ==========================================================
// 🔍 顧客詳細取得（GET /api/customers/:id）
// ==========================================================
router.get(
  "/:id",
  /* authorizeRoles("admin","manager","store_admin","store_staff"), */ getCustomerById
);

// ==========================================================
// 🔎 電話番号検索（GET /api/customers/search/phone?phone=...）
// - 予約時の顧客自動紐付けに使用
// ==========================================================
router.get(
  "/search/phone",
  /* authorizeRoles("admin","manager","store_admin","store_staff"), */ searchByPhone
);

// ==========================================================
// ➕ 顧客登録（POST /api/customers）
// ==========================================================
router.post(
  "/",
  /* authorizeRoles("admin","manager","store_admin"), */ createCustomer
);

// ==========================================================
// ✏️ 顧客情報更新（PUT /api/customers/:id）
// ==========================================================
router.put(
  "/:id",
  /* authorizeRoles("admin","manager","store_admin"), */ updateCustomer
);

// ==========================================================
// 🗒️ メモ追記（POST /api/customers/:id/memo）
// ==========================================================
router.post(
  "/:id/memo",
  /* authorizeRoles("admin","manager","store_admin","store_staff"), */ appendMemo
);

// ==========================================================
// 🎁 ポイント加減算（POST /api/customers/:id/points）
// body: { delta: number } 例: +10, -5
// ==========================================================
router.post(
  "/:id/points",
  /* authorizeRoles("admin","manager","store_admin"), */ updatePoints
);

// ==========================================================
// 🕔 直近5回の履歴（GET /api/customers/:id/recent-history）
// ==========================================================
router.get(
  "/:id/recent-history",
  /* authorizeRoles("admin","manager","store_admin","store_staff"), */ getRecentHistory
);

// ==========================================================
// ❌ 顧客削除（DELETE /api/customers/:id）
// ==========================================================
router.delete("/:id", /* authorizeRoles("admin","manager"), */ deleteCustomer);

module.exports = router;
