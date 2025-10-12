// ==========================================================
// backend/models/PublicCustomer.js
// ==========================================================
// 一般公開（パブリック）顧客モデル（CommonJS構成）
// - サイトから登録してログインする一般顧客を想定
// - bcryptでパスワード暗号化
// ==========================================================


const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const publicCustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "名前は必須です"], trim: true },
    email: {
      type: String,
      required: [true, "メールアドレスは必須です"],
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

// 保存前にパスワードハッシュ化
publicCustomerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// パスワード照合
publicCustomerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// パスワードを除外してJSON化
publicCustomerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("PublicCustomer", publicCustomerSchema);