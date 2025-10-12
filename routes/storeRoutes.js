// routes/storeRoutes.js
// 店舗関連のルーティング
// CommonJS構成対応

const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const { protect } = require("../middleware/authMiddleware");

// ✅ 新規店舗登録（管理者 or 店舗オーナーのみ）
router.post("/", protect, storeController.registerStore);

// ✅ 店舗一覧取得（認証不要でもOK）
router.get("/", storeController.getStores);

// ✅ 店舗詳細取得（URLパラメータで）
router.get("/:code", storeController.getStoreByCode);

module.exports = router;
