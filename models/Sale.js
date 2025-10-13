// ==========================================================
// backend/models/Sale.js
// ==========================================================
// 売上モデル（CommonJS構成）
// ----------------------------------------------------------
// 各注文(Order)と顧客(Customer)に紐づく
// 支払い方法・割引・原価・粗利などを記録
// ==========================================================

const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethods: [
      {
        method: { type: String, required: true }, // "cash", "credit", "paypay" など
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    costTotal: {
      type: Number,
      default: 0, // 原価
      min: 0,
    },
    grossProfit: {
      type: Number,
      default: 0, // 粗利
      min: 0,
    },
    saleDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// ==========================================================
// Hooks / Middlewares
// ----------------------------------------------------------
// 保存時に粗利を自動計算
// ==========================================================
saleSchema.pre("save", function (next) {
  this.grossProfit = this.totalAmount - (this.costTotal || 0);
  next();
});

module.exports = mongoose.model("Sale", saleSchema);
