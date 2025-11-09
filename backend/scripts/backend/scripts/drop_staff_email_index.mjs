import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../db.js";
import Staff from "../src/models/Staff.js";

async function main() {
  await connectDB(process.env.MONGO_URI);

  const col = mongoose.connection.collection("staffs");
  const idx = await col.indexes();
  console.log("Current indexes on staffs:", idx.map(i => i.name));

  // email_1 があれば削除
  if (idx.some(i => i.name === "email_1")) {
    try {
      await col.dropIndex("email_1");
      console.log("✅ Dropped index: email_1");
    } catch (e) {
      console.error("dropIndex email_1 failed:", e.message);
    }
  }

  // 念のため phone_1 があれば削除（古い実装の名残対策）
  if (idx.some(i => i.name === "phone_1")) {
    try {
      await col.dropIndex("phone_1");
      console.log("✅ Dropped index: phone_1");
    } catch (e) {
      console.error("dropIndex phone_1 failed:", e.message);
    }
  }

  // スキーマ定義に合わせて再同期（スキーマにない index は drop される）
  const dropped = await Staff.syncIndexes();
  console.log("syncIndexes done. dropped:", dropped);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
