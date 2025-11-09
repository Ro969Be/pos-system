import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../db.js";

async function main() {
  await connectDB(process.env.MONGO_URI);

  const col = mongoose.connection.collection("users");
  const idx = await col.indexes();
  console.log("Current indexes on users:", idx.map(i => `${i.name} ${JSON.stringify(i.key)} ${i.sparse ? "(sparse)" : ""}`));

  // 競合の元になっている既存インデックス名
  const targets = ["emailLower_1", "phoneNorm_1"];

  for (const name of targets) {
    const exists = idx.find(i => i.name === name);
    if (exists) {
      try {
        await col.dropIndex(name);
        console.log(`✅ Dropped index: ${name}`);
      } catch (e) {
        console.error(`dropIndex ${name} failed:`, e.message);
      }
    } else {
      console.log(`(skip) index not found: ${name}`);
    }
  }

  // ついでに staffs 側のレガシーindex（email_1/phone_1）が残っていれば落とす
  const staffs = mongoose.connection.collection("staffs");
  const sidx = await staffs.indexes();
  for (const name of ["email_1", "phone_1"]) {
    if (sidx.some(i => i.name === name)) {
      try {
        await staffs.dropIndex(name);
        console.log(`✅ Dropped staffs index: ${name}`);
      } catch (e) {
        console.error(`dropIndex staffs ${name} failed:`, e.message);
      }
    }
  }

  await mongoose.connection.close();
  console.log("Done.");
}

main().catch(e => { console.error(e); process.exit(1); });
