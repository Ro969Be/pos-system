// ==========================================================
// backend/server.js
// ==========================================================
// アプリケーションエントリーポイント（CommonJS構成）
// - Expressサーバー設定
// - CORS・JSON・ルーティング設定
// - MongoDB接続
// ==========================================================
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// ==========================================================
// 環境変数読み込み
// ==========================================================
dotenv.config();

// ==========================================================
// ルート読み込み
// ==========================================================
const authStaffRoutes = require("./routes/authStaffRoutes");
const authCustomerRoutes = require("./routes/authCustomerRoutes");
const authPublicCustomerRoutes = require("./routes/authPublicCustomerRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const customerRoutes = require("./routes/customerRoutes");

// ==========================================================
// Expressアプリ作成
// ==========================================================
const app = express();

// ==========================================================
// ミドルウェア設定
// ==========================================================
app.use(cors());
app.use(express.json());

// ==========================================================
// APIルート
// ==========================================================
app.use("/api/auth/staff", authStaffRoutes);
app.use("/api/auth/customer", authCustomerRoutes);
app.use("/api/auth/public-customer", authPublicCustomerRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/customers", customerRoutes);

// ==========================================================
// ルートテスト
// ==========================================================
app.get("/", (req, res) => {
  res.send("✅ POS API Server is running");
});

// ==========================================================
// MongoDB接続
// ==========================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB接続成功");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 サーバー起動: ポート ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB接続失敗:", err.message);
    process.exit(1);
  });