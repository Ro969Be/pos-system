// ==========================================================
// models/Payment.js
// ==========================================================
// 支払い情報モデル
// ----------------------------------------------------------
// 関連: Order（注文）
// フィールド: 注文ID, 支払い方法, 金額, ステータス
// ==========================================================

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    method: {
      type: String,
      enum: ["現金", "カード", "QR", "電子マネー"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
