// ==========================================================
// models/Shop.js（CommonJS構成・軽量版）
// ----------------------------------------------------------
// 顧客向けの「公開店舗情報」モデル。
// 主に PublicCustomer 向け画面（店舗検索・予約画面）で利用。
// 管理者側の詳細情報（スタッフ紐づけ・状態）は Store.js 側で保持。
// ----------------------------------------------------------
// 構成:
//  - code: 公開用の店舗コード（例: SH001）
//  - name: 店舗名（顧客向け表示用）
//  - address: 住所（地図や予約画面表示用）
//  - phone: 公開電話番号
//  - description: 紹介文など（任意）
//  - isPublic: 公開・非公開状態（true=表示）
// ----------------------------------------------------------
// 注意:
//  - 顧客向け表示のみを目的とするため、StaffやOwner情報は含まない。
//  - 多店舗展開でも、StoreとのID対応で管理可能。
// ==========================================================

const mongoose = require("mongoose");

// ==========================================================
// 🧩 スキーマ定義
// ==========================================================
const shopSchema = new mongoose.Schema(
  {
    // 店舗コード（ユニーク）
    code: {
      type: String,
      required: [true, "店舗コードは必須です"],
      unique: true,
      trim: true,
    },

    // 店舗名
    name: {
      type: String,
      required: [true, "店舗名は必須です"],
      trim: true,
    },

    // 住所
    address: {
      type: String,
      default: "",
      trim: true,
    },

    // 電話番号（公開用）
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // 紹介文（顧客向け）
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // 公開状態
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ==========================================================
// 🧩 JSON出力時の整形
// ==========================================================
shopSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// ==========================================================
// 🧩 モデルエクスポート
// ==========================================================
module.exports = mongoose.model("Shop", shopSchema);
