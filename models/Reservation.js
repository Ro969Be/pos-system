// ==========================================================
// models/Reservation.js
// ==========================================================
// 予約モデル
// - 氏名 / 電話 / 日時 / 人数 / コース / 席（複数可）
// - 予約作成時：電話番号照合で Customer と紐付け可能
// - 自動配席ロジックと連動（utils/seating.js）
// ==========================================================

const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    dateTime: { type: Date, required: true, index: true }, // 予約日時
    partySize: { type: Number, required: true, min: 1 }, // 人数

    // コース情報
    courseType: {
      type: String,
      enum: ["course", "seatOnly"],
      default: "seatOnly",
    },
    courseName: { type: String, default: "" }, // 例: "和食コースA"
    notes: { type: String, default: "" },

    // 自動配席結果（複数席）
    tableIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Table" }],

    // 状態
    status: {
      type: String,
      enum: ["reserved", "seated", "completed", "cancelled"],
      default: "reserved",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
