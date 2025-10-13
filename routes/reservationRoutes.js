// ==========================================================
// backend/routes/salesRoutes.js
// ==========================================================
// 売上関連ルート
// ----------------------------------------------------------
// APIエンドポイント一覧：
//  GET    /api/sales                全売上一覧
//  GET    /api/sales/:id            個別売上取得
//  POST   /api/sales                新規売上登録
//  PUT    /api/sales/:id            売上更新
//  DELETE /api/sales/:id            売上削除
// ----------------------------------------------------------
// 今後の拡張：カテゴリ別・時間帯別の集計用API
// ==========================================================

const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");

// ==========================================================
// 全売上取得
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().populate("order").populate("customer");
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 個別売上取得
// ==========================================================
router.get("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("order")
      .populate("customer");
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 新規売上登録
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const sale = new Sale(req.body);
    const savedSale = await sale.save();
    res.status(201).json(savedSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 売上更新
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const updatedSale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedSale)
      return res.status(404).json({ message: "Sale not found" });
    res.json(updatedSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 売上削除
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const deletedSale = await Sale.findByIdAndDelete(req.params.id);
    if (!deletedSale)
      return res.status(404).json({ message: "Sale not found" });
    res.json({ message: "Sale deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// モジュールエクスポート
// ==========================================================
module.exports = router;
