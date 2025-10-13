// ==========================================================
// models/PaymentMethod.js
// ==========================================================
// 決済種別マスタ
// ==========================================================

const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    code: { type: String, required: true, unique: true }, // 例: CASH, CREDIT, PAYPAY
    displayName: { type: String, required: true },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
