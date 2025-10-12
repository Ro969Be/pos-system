// ==========================================================
// backend/models/Customer.js
// ==========================================================
// 顧客モデル（CommonJS構成）
// bcryptでパスワード暗号化・JWT対応
// ==========================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// スキーマ定義
const customerSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

// 保存前にパスワード暗号化
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// パスワード照合
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// パスワードを除外してJSON化（APIレスポンス時にパスワードを含めない）
customerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Customer", customerSchema);
