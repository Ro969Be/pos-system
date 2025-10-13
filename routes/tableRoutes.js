// ==========================================================
// backend/routes/tableRoutes.js
// ==========================================================
// テーブル（席）管理ルート定義
// ----------------------------------------------------------
// APIエンドポイント：
//  GET    /api/tables              全テーブル一覧
//  GET    /api/tables/:id          個別テーブル取得
//  POST   /api/tables              新規テーブル登録
//  PUT    /api/tables/:id          更新
//  DELETE /api/tables/:id          削除
// ----------------------------------------------------------
// 今後の拡張予定：空席検索・自動配席機能
// ==========================================================

const express = require("express");
const router = express.Router();
const Table = require("../models/Table");

// ==========================================================
// 全テーブル取得
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 個別テーブル取得
// ==========================================================
router.get("/:id", async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 新規テーブル登録
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const table = new Table(req.body);
    const newTable = await table.save();
    res.status(201).json(newTable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// テーブル更新
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Table not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// テーブル削除
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Table.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// モジュールエクスポート
// ==========================================================
module.exports = router;
