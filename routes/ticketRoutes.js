// ==========================================================
// backend/routes/ticketRoutes.js
// ==========================================================
// チケット（伝票）ルート定義
// ----------------------------------------------------------
// APIエンドポイント一覧：
//  GET    /api/tickets              全伝票取得
//  GET    /api/tickets/:id          個別伝票取得
//  POST   /api/tickets              新規伝票作成
//  PUT    /api/tickets/:id          伝票更新
//  DELETE /api/tickets/:id          伝票削除
// ----------------------------------------------------------
// 追加機能：ステータス更新（open → closed）
// ==========================================================

const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");

// ==========================================================
// 全伝票取得
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("order")
      .populate("items.product");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 個別伝票取得
// ==========================================================
router.get("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("order")
      .populate("items.product");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// 新規伝票作成
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    const saved = await ticket.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 伝票更新
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Ticket not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ==========================================================
// 伝票削除
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ticket not found" });
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================================
// モジュールエクスポート
// ==========================================================
module.exports = router;
