const express = require("express");
const Ticket = require("../models/Ticket");
const Order = require("../models/Order");

const router = express.Router();

// 🔹 伝票作成（予約と紐付け or 空伝票）
router.post("/", async (req, res) => {
  try {
    const { orderId, tableNumber, staff } = req.body;

    let ticketData = { tableNumber, staff };
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "予約が見つかりません" });
      ticketData.order = order._id;
    }

    const ticket = new Ticket(ticketData);
    await ticket.save();

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 伝票一覧
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("items.product")
      .populate("order");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 商品追加
router.post("/:id/items", async (req, res) => {
  try {
    const { product, quantity, notes } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "伝票が見つかりません" });

    ticket.items.push({ product, quantity, notes });
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 伝票削除 or 閉じる
router.delete("/:id", async (req, res) => {
  try {
    const { mode } = req.query; // "cancel" or "close"

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "伝票が見つかりません" });

    if (mode === "close") {
      ticket.status = "closed";
      await ticket.save();
      // 🔹 売上DBに移動する処理はここで実装
    } else {
      ticket.status = "cancelled";
      await ticket.save();
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
