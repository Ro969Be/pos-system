// ==========================================================
// models/ReceiptSetting.js
// ==========================================================
// 店舗ごとの領収書設定
// ==========================================================

const mongoose = require("mongoose");

const receiptSettingSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    invoiceNumber: { type: String, default: "" }, // インボイス番号
    issuerName: { type: String, required: true }, // 発行者名（店舗名）
    issuerAddress: { type: String, default: "" },
    issuerTel: { type: String, default: "" },
    issuerNote: { type: String, default: "" },
    taxRate: { type: Number, default: 10 },
    defaultNote: { type: String, default: "上記の金額正に領収いたしました。" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReceiptSetting", receiptSettingSchema);
