// ==========================================================
// backend/routes/paymentRoutes.js
// ==========================================================
// 支払い方法関連ルート定義
// ----------------------------------------------------------
// APIエンドポイント一覧：
//  GET    /api/payments              支払い方法一覧取得
//  GET    /api/payments/:id          個別取得
//  POST   /api/payments              新規登録
//  PUT    /api/payments/:id          更新
//  DELETE /api/payments/:id          削除
// ----------------------------------------------------------
// 支払い種別：現金・クレジット・電子マネー・QRなど
// ==========================================================

const express = require("express");
const router = express.Router();
const PaymentMethod = require("../models/PaymentMethod");

// ==========================================================
// 全支払い方法取得
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const methods = await PaymentMethod.find();
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 個別支払い方法取得
// ==========================================================
router.get("/:id", async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method)
      return res.status(404).json({ message: "Payment method not found" });
    res.json(method);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 支払い方法登録
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const method = new PaymentMethod(req.body);
    const saved = await method.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 支払い方法更新
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const updated = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Payment method not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 支払い方法削除
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Payment method not found" });
    res.json({ message: "Payment method deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// モジュールエクスポート
// ==========================================================
module.exports = router;
