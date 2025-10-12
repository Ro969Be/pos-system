// ==========================================================
// backend/routes/authPublicCustomerRoutes.js
// ==========================================================
// 一般公開用 顧客登録・ログインAPI（CommonJS構成）
// ==========================================================

const express = require("express");
const jwt = require("jsonwebtoken");
const PublicCustomer = require("../models/PublicCustomer");

const router = express.Router();

// JWT生成関数
const generateToken = (id) =>
  jwt.sign({ id, type: "public-customer" }, process.env.JWT_SECRET, { expiresIn: "7d" });

// 一般顧客登録
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "全ての項目を入力してください" });

    const exists = await PublicCustomer.findOne({ email });
    if (exists) return res.status(400).json({ message: "既に登録済みのメールです" });

    const user = await PublicCustomer.create({ name, email, password });
    const token = generateToken(user._id);

    console.log( token, user );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error("❌ 一般顧客登録エラー:", error);
    res.status(500).json({ message: "登録に失敗しました" });
  }
});

// 一般顧客ログイン
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await PublicCustomer.findOne({ email });
    if (!user) return res.status(401).json({ message: "メール不正です" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "パスワードが不正です" });

    const token = generateToken(user._id);

    console.log( token, user );

    res.json({ token, user });
  } catch (error) {
    console.error("❌ 一般顧客ログインエラー:", error);
    res.status(500).json({ message: "ログイン処理に失敗しました" });
  }
});

module.exports = router;
