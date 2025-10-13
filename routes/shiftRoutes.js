// ==========================================================
// backend/routes/shiftRoutes.js
// ==========================================================
// シフト管理ルート
// ----------------------------------------------------------
// APIエンドポイント一覧：
//  GET    /api/shifts             全シフト一覧
//  GET    /api/shifts/:id         個別シフト取得
//  POST   /api/shifts             新規シフト作成
//  PUT    /api/shifts/:id         シフト更新
//  DELETE /api/shifts/:id         シフト削除
// ----------------------------------------------------------
// 担当スタッフ・日付・時間帯を管理
// ==========================================================

const express = require("express");
const router = express.Router();
const Shift = require("../models/Shift");

// ==========================================================
// 全シフト取得
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const shifts = await Shift.find().populate("staff");
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 個別シフト取得
// ==========================================================
router.get("/:id", async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id).populate("staff");
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// シフト作成
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const shift = new Shift(req.body);
    const saved = await shift.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// シフト更新
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Shift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Shift not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// シフト削除
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Shift.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Shift not found" });
    res.json({ message: "Shift deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// モジュールエクスポート
// ==========================================================
module.exports = router;
