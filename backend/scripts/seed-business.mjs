// backend/scripts/seed-business.mjs
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../db.js";
import Business from "../src/models/Business.js";
import Store from "../src/models/Store.js";

async function main() {
  await connectDB(process.env.MONGO_URI);

  const LOGIN_ID = "demo";
  const PASSWORD = "demo";

  // Business を upsert
  let biz = await Business.findOne({ loginId: LOGIN_ID });
  if (!biz) {
    biz = new Business({
      loginId: LOGIN_ID,
      name: "Demo Business",
      email: "demo@example.com",
      passwordHash: "",
    });
  }
  await biz.setPassword(PASSWORD);
  await biz.save();

  // Store を1件作成（なければ）
  let store = await Store.findOne({ businessId: biz._id, code: "DEMO-001" });
  if (!store) {
    store = await Store.create({
      businessId: biz._id,
      name: "デモ店舗 本店",
      code: "DEMO-001",
      phone: "03-0000-0000",
      address: "東京都テスト区1-2-3",
      type: "restaurant",
      settings: { serviceStartHour: 0 },
    });
  }

  console.log("✅ Seed completed");
  console.log("   loginId:", LOGIN_ID);
  console.log("   password:", PASSWORD);
  console.log("   storeId:", String(store._id));
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
