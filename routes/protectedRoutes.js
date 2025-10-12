// ==========================================================
// backend/routes/protectedRoutes.js
// ==========================================================
// JWT保護付きルート（認証テスト・ロール別アクセス確認用）
// ----------------------------------------------------------
// /protected/customer        顧客専用
// /protected/staff           スタッフ専用
// /protected/public-customer 一般顧客専用
// ==========================================================

const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ----------------------------------------------------------
// 顧客専用ルート
// ----------------------------------------------------------
router.get("/customer", protect, (req, res) => {
  if (req.userType === "customer") {
    return res.json({
      message: "✅ 顧客認証成功",
      user: req.user,
    });
  }
  res.status(403).json({ message: "権限がありません（顧客専用）" });
});

// ----------------------------------------------------------
// スタッフ専用ルート
// ----------------------------------------------------------
router.get("/staff", protect, (req, res) => {
  if (req.userType === "staff") {
    return res.json({
      message: "✅ スタッフ認証成功",
      user: req.user,
    });
  }
  res.status(403).json({ message: "権限がありません（スタッフ専用）" });
});

// ----------------------------------------------------------
// 一般顧客（PublicCustomer）専用ルート
// ----------------------------------------------------------
router.get("/public-customer", protect, (req, res) => {
  if (req.userType === "public-customer") {
    return res.json({
      message: "✅ 一般顧客認証成功",
      user: req.user,
    });
  }
  res.status(403).json({ message: "権限がありません（一般顧客専用）" });
});

module.exports = router;
