// ==========================================================
// models/Ticket.js
// ==========================================================
// 伝票モデル（領収書/レシート対応）
// - 宛名、但し書き、インボイス番号を追加
// - 店舗・オーダーとの紐付け
// - 各アイテム・ステータス管理
// ==========================================================

const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null, // 会計済み注文と紐付け
    },

    tableNumber: { type: Number, default: null },
    staff: { type: String, default: null },

    // ✅ 伝票内のアイテムリスト
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        notes: { type: String }, // 例: "氷なし", "大盛り"
      },
    ],

    // ✅ ステータス管理
    status: {
      type: String,
      enum: ["open", "closed", "cancelled"],
      default: "open",
    },

    // ✅ 領収書・インボイス対応
    receiptName: { type: String, trim: true }, // 宛名
    receiptNote: { type: String, trim: true }, // 但し書き
    invoiceNumber: { type: String, trim: true }, // インボイス登録番号
    issueDate: { type: Date, default: Date.now }, // 発行日
  },
  { timestamps: true }
);

// ✅ CommonJSエクスポート
module.exports = mongoose.model("Ticket", ticketSchema);
