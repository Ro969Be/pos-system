// server.js

const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const customerRoutes = require("./routes/customerRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
const tickets = require("./routes/tickets");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ アップロードしたファイルを静的に配信
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 初回起動時に管理者を自動作成
const createInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const admin = new User({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD, // ← ここでは生パスワードのまま
        role: "admin",
      });

      await admin.save(); // pre('save') でハッシュされる
      console.log("👑 初期管理者アカウントを作成しました");
      console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD}`);
    } else {
      console.log("✅ 管理者アカウントは既に存在します");
    }
  } catch (err) {
    console.error("⚠️ 管理者作成エラー:", err.message);
  }
};
createInitialAdmin();

// ✅ APIルート設定
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/tickets", tickets);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
