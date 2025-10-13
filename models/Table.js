// ==========================================================
// models/Table.js
// ==========================================================
// テーブル（座席）モデル
// - レイアウト座標（x, y）を持ち、フロアマップを表現
// - 予約/在席管理のための status を持つ
// ==========================================================

const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    name: { type: String, required: true, trim: true }, // 例: "テーブル1", "カウンターA"
    capacity: { type: Number, required: true, min: 1 }, // 着席人数
    type: {
      type: String,
      enum: ["table", "counter", "private", "other"],
      default: "table",
    },

    // レイアウト座標（pxなどUI任意単位）
    layout: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },

    // 在席状況
    status: {
      type: String,
      enum: ["vacant", "reserved", "occupied"],
      default: "vacant",
      index: true,
    },

    // 予約または利用中のリファレンス（必要に応じて）
    currentReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
