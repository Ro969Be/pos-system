// ==========================================================
// models/Shift.js
// ==========================================================
// 勤務シフトモデル
// - 日付 / 開始時刻 / 終了時刻 / 担当スタッフ
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
      ref: "Staff",
      required: true,
    },
    staffName: {
      type: String,
      required: true, // ✅ 必須フィールド
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true, // ✅ String型に変更
      trim: true,
    },
    endTime: {
      type: String,
      required: true, // ✅ String型に変更
      trim: true,
    },
    role: {
      type: String,
      default: "staff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);
