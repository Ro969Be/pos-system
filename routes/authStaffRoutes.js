// ==========================================================
// backend/routes/authStaffRoutes.js
// ==========================================================
// スタッフ登録・ログインAPI（CommonJS構成）
// - 登録時は pre('save') でパスワードがハッシュ化される
// - ログイン時は bcrypt.compare を使用
// - JWT には { id, type } を含める（type: "staff"）
// ==========================================================

const express = require("express");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

const router = express.Router();

// JWT生成関数
const generateToken = (id, type = "staff") =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: "7d" });

// スタッフ登録
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, store } = req.body;
    const exists = await Staff.findOne({ email });
    if (exists) return res.status(400).json({ message: "既に登録済みのメールです" });

    const staff = await Staff.create({ name, email, password, role, store });
    const token = generateToken(staff._id, "staff");

    console.log( token, staff );

    res.status(201).json({ token, user: staff });
  } catch (err) {
    console.error("staff register error:", err);
    res.status(500).json({ message: "スタッフ登録に失敗しました" });
  }
});

// スタッフログイン
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(401).json({ message: "メールが不正です" });

    const isMatch = await staff.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "パスワードが不正です" });

    const token = generateToken(staff._id, "staff");

    console.log( token, staff );

    res.json({ token, user: staff });
  } catch (err) {
    console.error("スタッフログインエラー:", err);
    res.status(500).json({ message: "ログイン処理に失敗しました" });
  }
});

module.exports = router;