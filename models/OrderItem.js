// ================================================
// models/OrderItem.js
// 注文アイテムモデル
// ================================================
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "ready", "served"],
      default: "pending",
    },
    table: { type: String, required: true },
    station: { type: String, enum: ["kitchen", "drinker"], required: true },
    provideTime: { type: Number, default: 10 }, // 提供時間(分)
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", orderItemSchema);
