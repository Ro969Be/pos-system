// ==========================================================
// controllers/ticketController.js
// ==========================================================
// チケット（伝票/レシート/領収書）管理コントローラ
// ----------------------------------------------------------
// ✅ 機能：
//   - 伝票一覧/詳細取得
//   - 領収書PDF生成（宛名・但し書き・インボイス対応）
//   - 領収書情報更新API
// ==========================================================

const Ticket = require("../models/Ticket");
const Order = require("../models/Order");
const Store = require("../models/Store");
const generateReceiptPDF = require("../utils/generateReceiptPDF");

// ----------------------------------------------------------
// 全伝票一覧取得（GET /api/tickets）
// ----------------------------------------------------------
exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ storeId: req.storeId })
      .populate("order")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// 伝票単体取得（GET /api/tickets/:id）
// ----------------------------------------------------------
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("order");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------------------------------------------
// 領収書PDF生成（GET /api/tickets/:id/receipt）
// ----------------------------------------------------------
exports.generateReceipt = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate({
      path: "order",
      populate: { path: "items.product" },
    });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const store = await Store.findById(ticket.storeId);
    await generateReceiptPDF(ticket, ticket.order, store, res);
  } catch (err) {
    console.error("generateReceipt error:", err);
    res.status(500).json({ message: "PDF生成エラー" });
  }
};

// ----------------------------------------------------------
// 領収書情報更新（PUT /api/tickets/:id/receipt-info）
// ----------------------------------------------------------
exports.updateReceiptInfo = async (req, res) => {
  try {
    const { receiptName, receiptNote, invoiceNumber } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { receiptName, receiptNote, invoiceNumber },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
