// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    }, // 追加
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, default: 0 }, // 原価設定(後述機能12と共通)
    stock: { type: Number, default: null },
    category: { type: String },
    imageUrl: { type: String },
    expectedStock: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
