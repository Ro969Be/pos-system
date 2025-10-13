// ==========================================================
// backend/routes/cashSessionRoutes.js
// ==========================================================
// 現金セッション管理ルート
// ----------------------------------------------------------
// 会計開設・締め処理、レジ残高確認などを行うAPI
// ----------------------------------------------------------
//  GET    /api/cash-sessions             全セッション取得
//  GET    /api/cash-sessions/:id         個別セッション取得
//  POST   /api/cash-sessions/open        開設処理
//  PUT    /api/cash-sessions/close/:id   締め処理
//  DELETE /api/cash-sessions/:id         削除
// ==========================================================

const express = require("express");
const router = express.Router();
const CashSession = require("../models/CashSession");

// ==========================================================
// 全セッション取得
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const sessions = await CashSession.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 個別セッション取得
// ==========================================================
router.get("/:id", async (req, res) => {
  try {
    const session = await CashSession.findById(req.params.id);
    if (!session)
      return res.status(404).json({ message: "Cash session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 開設（レジ開始）
// ==========================================================
router.post("/open", async (req, res) => {
  try {
    const { openingAmount, staff } = req.body;

    const openSession = new CashSession({
      openedBy: staff || "system",
      openingAmount: openingAmount || 0,
      isOpen: true,
      openedAt: new Date(),
    });

    const saved = await openSession.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 締め（レジ終了）
// ==========================================================
router.put("/close/:id", async (req, res) => {
  try {
    const { closingAmount, note } = req.body;
    const session = await CashSession.findById(req.params.id);

    if (!session) return res.status(404).json({ message: "Session not found" });
    if (!session.isOpen)
      return res.status(400).json({ message: "Session already closed" });

    session.closingAmount = closingAmount;
    session.closedAt = new Date();
    session.note = note || "";
    session.isOpen = false;

    const saved = await session.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// セッション削除
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await CashSession.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Cash session deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// モジュールエクスポート
// ==========================================================
module.exports = router;
