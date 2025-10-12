// backend/routes/categoryPresetRoutes.js
// カテゴリー提供時間プリセット API ルート（管理者認証を required にする）

const express = require("express");
const router = express.Router();
const CategoryPresetController = require("../controllers/categoryPresetController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// 一覧取得（一般利用者も欲しい場合は protect を外しても良い）
// ここでは一覧は公開（管理UI は認証済み）にしておく
router.get("/", CategoryPresetController.listPresets);

// 単一取得（公開）
router.get("/:id", CategoryPresetController.getPreset);

// 以下は管理者のみアクセス可能
router.post("/", protect, adminOnly, CategoryPresetController.createPreset);
router.put("/:id", protect, adminOnly, CategoryPresetController.updatePreset);
router.delete("/:id", protect, adminOnly, CategoryPresetController.deletePreset);

module.exports = router;
