// models/Preset.js
// -------------------------------------------------------
// 提供時間プリセット設定モデル
// 各カテゴリー（例：ドリンク・フードなど）ごとの
// デフォルト提供時間を管理する。
// -------------------------------------------------------

const mongoose = require("mongoose");

const PresetSchema = new mongoose.Schema(
  {
    categoryCode: {
      type: String, // カテゴリーコード（例：drink, food, dessert）
      required: true,
      unique: true, // 各カテゴリーにつき1つのプリセット
    },
    categoryName: {
      type: String, // カテゴリー名（例：ドリンク）
      required: true,
    },
    defaultServeTime: {
      type: Number, // 提供時間（分単位）
      required: true,
      default: 5,
    },
    updatedBy: {
      type: String, // 最後に変更したユーザー（任意）
      default: "system",
    },
  },
  { timestamps: true } // 作成・更新日時を自動追加
);

module.exports = mongoose.model("Preset", PresetSchema);
