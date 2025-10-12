// ==========================================================
// backend/seed.js
// ==========================================================
// データベース初期化スクリプト（CommonJS構成）
// モデル側で自動暗号化されるため、ここでは生パスワードをそのまま登録
// ==========================================================

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// モデル読み込み
const Staff = require("./models/Staff");
const Customer = require("./models/Customer");
const PublicCustomer = require("./models/PublicCustomer");

// .env 読み込み
dotenv.config();

// MongoDB 接続
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB接続成功（seed.js）"))
  .catch((err) => {
    console.error("❌ MongoDB接続失敗:", err.message);
    process.exit(1);
  });

const seedData = async () => {
  try {
    console.log("⚙️ 既存データ削除中...");
    await Staff.deleteMany();
    await Customer.deleteMany();
    await PublicCustomer.deleteMany();

    console.log("🧩 初期データ作成中...");

    // Staff（管理者）
    const admin = await Staff.create({
      name: process.env.ADMIN_NAME || "管理者A",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "admin123", // 生パスワード（モデルで自動ハッシュ化）
      role: "admin",
    });

    // Customer（顧客）
    const customer = await Customer.create({
      name: "山田太郎",
      email: "taro@example.com",
      password: "123456", // 生パスワード（モデルで自動ハッシュ化）
    });

    // PublicCustomer（一般顧客）
    const publicUser = await PublicCustomer.create({
      name: "一般顧客ユーザー",
      email: "public@example.com",
      password: "password123", // 生パスワード（モデルで自動ハッシュ化）
    });

    console.log("✅ 初期データ登録完了！");
    console.log("📦 Staff（管理者）:", admin);
    console.log("📦 Customer（顧客）:", customer);
    console.log("📦 PublicCustomer（一般顧客）:", publicUser);

    process.exit(0);
  } catch (error) {
    console.error("❌ 初期データ登録エラー:", error.message);
    process.exit(1);
  }
};

// 実行
seedData();
