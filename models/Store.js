// ==========================================================
// models/Store.js（CommonJS構成・完全対応版）
// ----------------------------------------------------------
// 店舗情報モデル。
// 各店舗の基本情報（コード、名前、住所、電話番号、状態など）を保持し、
// オーナー（Staffモデル）およびスタッフリストと紐づけ可能に設計。
// ----------------------------------------------------------
// 構成:
//  - storeCode: 店舗コード（例: ST001）※ユニーク
//  - storeName: 店舗名
//  - address: 住所
//  - phone: 電話番号
//  - owner: オーナー（Staffモデル参照）
//  - staffMembers: スタッフ配列（Staffモデル参照）
//  - status: 稼働状態（active / inactive）
//  - description: 店舗メモ（任意）
// ----------------------------------------------------------
// 備考:
//  - 将来的に多店舗展開を見据え、owner と staffMembers の両方を保持。
//  - Staff モデルとの関係は 1対多。
// ==========================================================

const mongoose = require("mongoose");

// ==========================================================
// 🧩 スキーマ定義
// ==========================================================
const storeSchema = new mongoose.Schema(
  {
    // 店舗コード（ユニークID）
    storeCode: {
      type: String,
      required: [true, "店舗コードは必須です"],
      unique: true,
      trim: true,
      index: true,
    },

    // 店舗名
    storeName: {
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

    // 電話番号
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // 店舗の説明・メモ
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // オーナー（Staffモデル参照）
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Staffモデルとリレーション
      required: [true, "店舗オーナー情報が必要です"],
    },

    // 所属スタッフリスト（複数可）
    staffMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff", // Staffモデルとの紐づけ
      },
    ],

    // 店舗状態（稼働 or 非稼働）
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, // 作成日時・更新日時を自動管理
  }
);

// ==========================================================
// 🧩 インデックス設定
// ----------------------------------------------------------
// 将来的な検索効率向上のため、storeName に部分一致検索用インデックスを追加
// ==========================================================
storeSchema.index({ storeName: "text" });

// ==========================================================
// 🧩 toJSON 時の整形
// ----------------------------------------------------------
// API レスポンス時に不要な内部情報を除外する。
// ==========================================================
storeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v; // バージョンキー除外
  return obj;
};

// ==========================================================
// 🧩 モデルエクスポート
// ==========================================================
module.exports = mongoose.model("Store", storeSchema);
