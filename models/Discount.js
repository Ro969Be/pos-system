// ==========================================================
// models/Discount.js
// ==========================================================
// 割引・割増ルール定義モデル
// - クーポンやポイント利用に対応
// - 金額・割合の両方に対応（+¥, -¥, +%, -%）
// ==========================================================

const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // 割引名
    type: {
      type: String,
      enum: ["fixed", "percent"],
      required: true,
    }, // fixed=定額, percent=割合
    value: { type: Number, required: true }, // 値（例: 500円, 10%）
    direction: {
      type: String,
      enum: ["increase", "decrease"],
      default: "decrease",
    }, // increase=割増, decrease=割引
    isActive: { type: Boolean, default: true },
    applicableTo: {
      type: String,
      enum: ["order", "item"],
      default: "order",
    }, // order全体 or item単位
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discount", discountSchema);
