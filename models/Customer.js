// ==========================================================
// backend/models/Customer.js
// ==========================================================
// 顧客モデル（CommonJS構成）
// bcryptでパスワード暗号化・JWT対応
// 来店回数・前回来店日時・直近履歴（最大5件）・属性・電話番号・メモ・ポイント
// ==========================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// スキーマ定義
const customerSchema = new mongoose.Schema(
  {
    // マルチテナント対応（店舗ごと）
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    name: { type: String, required: [true, "名前は必須です"], trim: true },

    email: {
      type: String,
      required: [true, "メールアドレスは必須です"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "有効なメールアドレスを入力してください"],
    },

    password: {
      type: String,
      required: [true, "パスワードは必須です"],
      minlength: [6, "パスワードは6文字以上である必要があります"],
    },

    // 🔽 追加属性
    phone: { type: String, index: true, trim: true }, // 予約時の照合キー
    birthdate: { type: Date, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other", "unknown"],
      default: "unknown",
    },

    // 🔽 来店統計
    visitCount: { type: Number, default: 0 },
    lastVisit: { type: Date, default: null },

    // 🔽 直近5回の履歴（先頭=最新）
    //     { date, orderId, total }
    visitHistory: [
      {
        date: { type: Date, required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        total: { type: Number, default: 0 },
      },
    ],

    // 🔽 顧客メモ
    memo: { type: String, default: "" },

    // 🔽 ポイント（割引や特典で利用）
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 保存前にパスワード暗号化（既存コメント保持）
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// パスワード照合（既存コメント保持）
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// パスワードを除外してJSON化（APIレスポンス時にパスワードを含めない）（既存コメント保持）
customerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Customer", customerSchema);
