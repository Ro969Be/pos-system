const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },   // 例: "cash", "card", "emoney", "paypay"
    displayName: { type: String, required: true },          // UI 表示用
    isActive: { type: Boolean, default: true },             // 使用可否
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

module.exports = PaymentMethod;
