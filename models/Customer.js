// Customer.js

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "メールアドレスの形式が不正です"],
    },
    notes: { type: String }, // アレルギーや施術メモなど
    isActive: { type: Boolean, default: true }, // 論理削除用
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
