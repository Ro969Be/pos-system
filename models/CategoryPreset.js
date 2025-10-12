// backend/models/CategoryPreset.js
// カテゴリー別 提供時間プリセットモデル
const mongoose = require("mongoose");

const categoryPresetSchema = new mongoose.Schema(
  {
    // カテゴリー名（例: "drink", "food", "appetizer", "meat"）
    category: { type: String, required: true, unique: true, index: true },

    // 提供時間（分）
    provideTime: { type: Number, required: true, default: 10 },

    // 説明（管理用）
    description: { type: String },

    // 有効フラグ（将来、非表示などに使える）
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CategoryPreset", categoryPresetSchema);
