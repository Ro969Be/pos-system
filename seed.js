// seed.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Order = require("./models/Order");
const Product = require("./models/Product");
const PaymentMethod = require("./models/PaymentMethod");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

async function seed() {
  try {
    console.log("🧹 既存データ削除中...");
    await Promise.all([
      Order.deleteMany({}),
      Product.deleteMany({}),
      PaymentMethod.deleteMany({}),
    ]);

    console.log("💳 支払方法作成中...");
    const paymentMethods = await PaymentMethod.insertMany([
      { name: "cash", displayName: "現金" },
      { name: "credit", displayName: "クレジットカード" },
      { name: "paypay", displayName: "PayPay" },
      { name: "emoney", displayName: "電子マネー" },
    ]);

    const paymentMap = {};
    paymentMethods.forEach((m) => (paymentMap[m.displayName] = m));

    console.log("🍔 商品を作成中...");
    const products = await Product.insertMany([
      { name: "カレーライス", price: 900 },
      { name: "ハンバーグ定食", price: 1200 },
      { name: "唐揚げ定食", price: 1000 },
      { name: "焼き魚定食", price: 1100 },
      { name: "ラーメン", price: 850 },
      { name: "チャーハン", price: 800 },
      { name: "餃子セット", price: 950 },
      { name: "オムライス", price: 1000 },
      { name: "スパゲッティナポリタン", price: 950 },
      { name: "ピザトースト", price: 600 },
      { name: "サンドイッチ", price: 700 },
      { name: "コーヒー", price: 400 },
      { name: "紅茶", price: 400 },
      { name: "オレンジジュース", price: 350 },
      { name: "ミルクティー", price: 450 },
      { name: "抹茶ラテ", price: 500 },
      { name: "ケーキセット", price: 700 },
      { name: "プリンアラモード", price: 650 },
      { name: "ハンバーガー", price: 800 },
      { name: "ポテトフライ", price: 400 },
    ]);

    console.log("🧾 注文データを作成中...");

    const now = new Date();

    // --- 🔹 ランダム商品を選択 ---
    const getRandomItems = () => {
      const count = Math.floor(Math.random() * 3) + 1;
      const selected = [];
      for (let i = 0; i < count; i++) {
        const p = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        selected.push({ product: p._id, quantity });
      }
      return selected;
    };

    // --- 🔹 合計金額計算 ---
    const getTotalAmount = (items) =>
      items.reduce((sum, i) => {
        const product = products.find((p) => p._id.equals(i.product));
        return sum + product.price * i.quantity;
      }, 0);

    // --- 🔹 支払いを金額と一致させる ---
    const getRandomPayment = (amount) => {
      const methodKeys = Object.keys(paymentMap);
      const method =
        paymentMap[methodKeys[Math.floor(Math.random() * methodKeys.length)]];
      return [{ method: method._id, amount: Math.round(amount) }];
    };

    // --- 🔹 注文生成 ---
    const makeOrder = (customerName, dateOffsetDays) => {
      const reservationDate = new Date(
        now.getTime() + dateOffsetDays * 24 * 60 * 60 * 1000
      );
      const items = getRandomItems();
      const total = Math.round(getTotalAmount(items));
      const payments = getRandomPayment(total);

      return {
        customerName,
        reservationDate,
        items,
        payments,
        status: "completed",
      };
    };

    // --- 🔹 注文データ ---
    const orders = [
      // 過去
      makeOrder("過去のお客様1", -10),
      makeOrder("過去のお客様2", -3),
      makeOrder("過去のお客様3", -1),

      // 現在
      makeOrder("現在のお客様A", 0),
      makeOrder("現在のお客様B", 0),

      // 未来
      makeOrder("未来のお客様1", 1),
      makeOrder("未来のお客様2", 3),
      makeOrder("未来のお客様3", 7),
    ];

    // --- ✅ save() で pre('save') を発火させる ---
    for (const orderData of orders) {
      const order = new Order(orderData);
      await order.save();
    }

    console.log("🌱 ダミーデータ投入完了！");
    console.log(`   支払方法: ${paymentMethods.length}件`);
    console.log(`   商品: ${products.length}件`);
    console.log(`   注文: ${orders.length}件`);
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
