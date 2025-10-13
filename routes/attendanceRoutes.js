// ==========================================================
// backend/routes/attendanceRoutes.js
// ==========================================================
// 勤怠管理ルート
// ----------------------------------------------------------
// APIエンドポイント一覧：
//  GET    /api/attendance              勤怠一覧
//  GET    /api/attendance/:id          個別取得
//  POST   /api/attendance              出勤登録
//  PUT    /api/attendance/:id          更新（退勤など）
//  DELETE /api/attendance/:id          削除
// ----------------------------------------------------------
// 出退勤時間、労働時間、スタッフ紐付けなどを管理
// ==========================================================

const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// ==========================================================
// 全勤怠取得
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find().populate("staff");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 個別勤怠取得
// ==========================================================
router.get("/:id", async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id).populate("staff");
    if (!record)
      return res.status(404).json({ message: "Attendance record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 勤怠登録（出勤）
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    const saved = await attendance.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 勤怠更新（退勤など）
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Attendance record not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 勤怠削除
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Attendance record not found" });
    res.json({ message: "Attendance record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// モジュールエクスポート
// ==========================================================
module.exports = router;
