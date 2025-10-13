// ==========================================================
// backend/seed.js
// ==========================================================
// POSシステム 全コレクション初期化スクリプト
// ----------------------------------------------------------
// ✅ Reservationモデル仕様対応済み（name, phone, dateTime, partySize）
// ==========================================================

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Staff = require("./models/Staff");
const Store = require("./models/Store");
const Customer = require("./models/Customer");
const PublicCustomer = require("./models/PublicCustomer");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Payment = require("./models/Payment");
const Table = require("./models/Table");
const Reservation = require("./models/Reservation");
const Shift = require("./models/Shift");
const Report = require("./models/Report");

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
    await Promise.all([
      Staff.deleteMany(),
      Store.deleteMany(),
      Customer.deleteMany(),
      PublicCustomer.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      Payment.deleteMany(),
      Table.deleteMany(),
      Reservation.deleteMany(),
      Shift.deleteMany(),
      Report.deleteMany(),
    ]);

    console.log("🧩 初期データ作成中...");

    // 1️⃣ Staff
    const admin = await Staff.create({
      name: "管理者A",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });
    const staff1 = await Staff.create({
      name: "スタッフB",
      email: "staff@example.com",
      password: "staff123",
      role: "staff",
    });

    // 2️⃣ Store
    const store = await Store.create({
      storeName: "本店",
      storeCode: "TOKYO-001",
      location: "東京都新宿区1-2-3",
      phone: "03-0000-0000",
      owner: admin._id,
    });

    // 3️⃣ Customer
    const customers = [];
    const customerData = [
      {
        name: "山田太郎",
        email: "taro@example.com",
        password: "123456",
        phone: "080-1111-2222",
        storeId: store._id,
      },
      {
        name: "佐藤花子",
        email: "hanako@example.com",
        password: "654321",
        phone: "080-3333-4444",
        storeId: store._id,
      },
    ];

    // create() は pre('save') を実行する
    for (const data of customerData) {
      const customer = await Customer.create(data);
      customers.push(customer);
    }

    // 4️⃣ PublicCustomer
    const publicUsers = await PublicCustomer.insertMany([
      {
        name: "一般ユーザー1",
        email: "public1@example.com",
        password: "public123",
      },
      {
        name: "一般ユーザー2",
        email: "public2@example.com",
        password: "public456",
      },
    ]);

    // 5️⃣ Category
    const categories = await Category.insertMany([
      {
        storeId: store._id,
        name: "ドリンク",
        code: "DRK",
        description: "各種ドリンクメニュー",
      },
      {
        storeId: store._id,
        name: "フード",
        code: "FOOD",
        description: "主食・おつまみなど",
      },
      {
        storeId: store._id,
        name: "デザート",
        code: "DSRT",
        description: "スイーツメニュー",
      },
    ]);

    // 6️⃣ Product
    const products = await Product.insertMany([
      {
        name: "コーヒー",
        price: 400,
        category: categories[0]._id,
        storeId: store._id,
      },
      {
        name: "紅茶",
        price: 450,
        category: categories[0]._id,
        storeId: store._id,
      },
      {
        name: "カレーライス",
        price: 850,
        category: categories[1]._id,
        storeId: store._id,
      },
    ]);

    // 7️⃣ Table
    const tables = await Table.insertMany([
      {
        storeId: store._id,
        name: "テーブル1",
        capacity: 4,
        status: "vacant",
      },
      {
        storeId: store._id,
        name: "テーブル2",
        capacity: 2,
        status: "occupied",
      },
      {
        storeId: store._id,
        name: "カウンター1",
        capacity: 1,
        status: "reserved",
      },
    ]);

    // 8️⃣ Order
    const orders = await Order.insertMany([
      {
        storeId: store._id,
        reservationDate: new Date(),
        status: "reserved",
        items: [
          { product: products[0]._id, quantity: 2, taxRate: 10 },
          { product: products[1]._id, quantity: 1, taxRate: 8 },
        ],
      },
      {
        storeId: store._id,
        reservationDate: new Date(),
        status: "completed",
        items: [{ product: products[2]._id, quantity: 1, taxRate: 10 }],
      },
    ]);

    // 9️⃣ Payment（orderIdを指定）
    await Payment.insertMany([
      {
        orderId: orders[0]._id,
        method: "現金",
        amount: 1250,
        status: "completed",
      },
      {
        orderId: orders[1]._id,
        method: "カード",
        amount: 850,
        status: "completed",
      },
    ]);

    // 🔟 Reservation（モデル準拠で修正）
    await Reservation.insertMany([
      {
        storeId: store._id,
        name: "山田太郎",
        phone: "080-1111-2222",
        customer: customers[0]._id,
        dateTime: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3時間後
        partySize: 2,
        courseType: "seatOnly",
        notes: "窓際希望",
        tableIds: [tables[0]._id],
      },
      {
        storeId: store._id,
        name: "佐藤花子",
        phone: "080-3333-4444",
        customer: customers[1]._id,
        dateTime: new Date(Date.now() + 1000 * 60 * 60 * 5),
        partySize: 3,
        courseType: "course",
        courseName: "ランチコースA",
        tableIds: [tables[1]._id],
      },
    ]);

    // 11️⃣ Shift
    await Shift.insertMany([
      {
        staffId: staff1._id,
        staffName: staff1.name, // ✅ 追加（必須）
        storeId: store._id,
        date: new Date(),
        startTime: "09:00",
        endTime: "18:00",
      },
    ]);

    // 12️⃣ Report
    await Report.create({
      storeId: store._id,
      date: new Date(),
      totalSales: 2100,
      totalOrders: 2,
      notes: "通常営業",
    });

    console.log("✅ すべてのコレクションに初期データ登録完了！");
    console.log("🏪 店舗:", store.storeName, "🧾 注文数:", orders.length);

    process.exit(0);
  } catch (error) {
    console.error("❌ 初期データ登録エラー:", error.message);
    process.exit(1);
  }
};

seedData();
