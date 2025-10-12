// ==========================================================
// backend/routes/authCustomerRoutes.js
// ==========================================================
// 顧客認証ルート（CommonJS構成）
// - 登録 / ログイン / 顧客一覧取得
// - bcrypt暗号化済み + JWTトークン発行対応
// ==========================================================
const express = require("express");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const router = express.Router();

// JWT生成関数
const generateToken = (id) =>
  jwt.sign({ id, type: "customer" }, process.env.JWT_SECRET, { expiresIn: "7d" });

// 顧客登録
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "全ての項目を入力してください" });

    const exists = await Customer.findOne({ email });
    if (exists) return res.status(400).json({ message: "既に登録済みのメールです" });

    const customer = await Customer.create({ name, email, password });
    const token = generateToken(customer._id);

    console.log( token, customer );

    res.status(201).json({ token, user: customer });
  } catch (error) {
    console.error("❌ 顧客登録エラー:", error);
    res.status(500).json({ message: "登録に失敗しました" });
  }
});

// 顧客ログイン
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(401).json({ message: "メールが不正です" });

    const isMatch = await customer.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "パスワードが不正です" });

    const token = generateToken(customer._id);

    console.log( token, customer );

    res.json({ token, user: customer });
  } catch (error) {
    console.error("❌ 顧客ログインエラー:", error);
    res.status(500).json({ message: "ログイン処理に失敗しました" });
  }
});

module.exports = router;