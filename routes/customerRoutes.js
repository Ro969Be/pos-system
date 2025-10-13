// ==========================================================
// backend/routes/customerRoutes.js
// ==========================================================
// 顧客ルート（CommonJS構成）
// ----------------------------------------------------------
// ✅ 顧客一覧・詳細・登録・更新・削除APIを定義
// ✅ JWT認証 + ロール制御対応
// ----------------------------------------------------------
// 権限制御：
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
} = require("../controllers/customerController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================================
// 📋 顧客一覧取得（GET /api/customers）
// ==========================================================
router.get(
  "/",
  protect,
  authorizeRoles("admin", "manager", "store_admin", "store_staff"),
  getCustomers
);

// ==========================================================
// 🔍 顧客詳細取得（GET /api/customers/:id）
// ==========================================================
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "manager", "store_admin", "store_staff"),
  getCustomerById
);

// ==========================================================
// ➕ 顧客登録（POST /api/customers）
// ==========================================================
router.post(
  "/",
  protect,
  authorizeRoles("admin", "manager", "store_admin"),
  createCustomer
);

// ==========================================================
// ✏️ 顧客更新（PUT /api/customers/:id）
// ==========================================================
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "manager", "store_admin"),
  updateCustomer
);

// ==========================================================
// ❌ 顧客削除（DELETE /api/customers/:id）
// ==========================================================
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "manager"),
  deleteCustomer
);

// ==========================================================
// モジュールエクスポート（CommonJS構成）
// ==========================================================
module.exports = router;
