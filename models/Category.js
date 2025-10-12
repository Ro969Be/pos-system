// models/Category.js
// --------------------------------------------
// 商品カテゴリーのスキーマ
// （例：ドリンク・フード・デザートなど）
// --------------------------------------------

const mongoose = require("mongoose");

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // カテゴリー名（例：ドリンク）
  },
  code: {
    type: String,
    required: true, // 識別用コード（例：drink）
    unique: true,
  },
});

module.exports = mongoose.model("Category", CategorySchema);
