// ==========================================================
// models/CashSession.js
// ==========================================================
// レジ開閉・締め情報
// - openingCash: 開始時のレジ現金
// - closingCash: 閉店時の実際のレジ現金
// - expectedCash: 期待現金（opening + 当日現金売上）
// - overShort: 差異（closing - expected）
// ==========================================================
const mongoose = require("mongoose");

const cashSessionSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    businessDate: { type: Date, required: true, index: true }, // 営業日
    openedBy: { type: String, required: true }, // 担当者名
    closedBy: { type: String, default: "" },
    openingCash: { type: Number, required: true, min: 0 },
    closingCash: { type: Number, default: 0, min: 0 },
    expectedCash: { type: Number, default: 0, min: 0 },
    overShort: { type: Number, default: 0 }, // 差異
    note: { type: String, default: "" },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CashSession", cashSessionSchema);
