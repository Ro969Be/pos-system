import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../db.js";
import User from "../src/models/User.js";
import Staff from "../src/models/Staff.js";

// 正規化（V2でも使う）
function normalizeEmail(s){ return (s || "").trim().toLowerCase(); }
function normalizePhone(s){
  return (s || "").replace(/[－ー―−﹣﹘]/g, "-").replace(/[^\d+]/g, "");
}

const DRY = process.env.DRY_RUN === "1";

async function main(){
  await connectDB(process.env.MONGO_URI);

  const cur = Staff.find({ $or: [{userId: {$exists:false}}, {userId: null}] }).cursor();

  let touched=0, created=0, linked=0, addStore=0, skipped=0;

  for await (const s of cur) {
    touched++;
    // 旧フィールドから手掛かり
    const email = s.email || null;
    const phone = s.phone || null;

    if (!email && !phone) { skipped++; continue; }

    // 既存User検索
    let u = null;
    if (email) u = await User.findOne({ $or: [{ email }, { emailLower: normalizeEmail(email) }] });
    if (!u && phone) u = await User.findOne({ $or: [{ phone }, { phoneNorm: normalizePhone(phone) }] });

    // 無ければ作成
    if (!u) {
      const payload = {
        name: s.name || "",
        email, phone,
        emailLower: normalizeEmail(email),
        phoneNorm: normalizePhone(phone),
        storeIds: [],
      };
      if (!DRY) u = await User.create(payload);
      else { u = new User(payload); u._id = new mongoose.Types.ObjectId(); }
      created++;
    }

    // storeIds に追加
    if (!DRY) {
      const r = await User.updateOne({ _id: u._id }, { $addToSet: { storeIds: s.storeId } });
      if (r.modifiedCount) addStore++;
    }

    // staff.userId を付与
    if (!DRY) {
      s.userId = u._id;
      await s.save();
    }
    linked++;
  }

  console.log({ touched, createdUsers: created, linkedStaffs: linked, addStore, skipped });
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
