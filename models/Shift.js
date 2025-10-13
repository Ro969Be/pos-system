// ==========================================================
// models/Shift.js
// ==========================================================
// スタッフのシフト予定（storeIdスコープ）
// - date, startTime, endTime をISOで保存
// - staffName は自由記述（既存のスタッフ管理が無くても運用可能）
// ==========================================================
const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // 任意（ユーザ管理がある場合）
    staffName: { type: String, required: true, trim: true },
    role: { type: String, default: "staff" },
    date: { type: Date, required: true, index: true }, // その日の0:00など
    startTime: { type: Date, required: true }, // 実シフト開始
    endTime: { type: Date, required: true }, // 実シフト終了
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
