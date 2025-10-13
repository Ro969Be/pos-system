// ==========================================================
// models/Attendance.js
// ==========================================================
// 勤怠打刻
// - clockIn / clockOut / breaks / totalMinutes
// - totalMinutes は clockOut時に計算（サーバ側）
// ==========================================================
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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
    },
    staffName: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true }, // 営業日
    clockIn: { type: Date, required: true },
    clockOut: { type: Date, default: null },
    breaks: [{ start: Date, end: Date }], // 休憩
    totalMinutes: { type: Number, default: 0 }, // 算出フィールド
    memo: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
