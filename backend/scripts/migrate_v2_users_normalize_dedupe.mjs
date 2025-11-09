import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../db.js";
import User from "../src/models/User.js";
import Staff from "../src/models/Staff.js";

function normalizeEmail(s){ return (s || "").trim().toLowerCase(); }
function normalizePhone(s){
  return (s || "")
    .replace(/[（）()　\s]/g, "")         // 空白・全角括弧除去
    .replace(/[－ー―−﹣﹘]/g, "-")        // 全角ハイフン→半角
    .replace(/[^\d+]/g, "");              // 数字/先頭+ 以外除去
}

const DRY = process.env.DRY_RUN === "1";

async function normalizeAllUsers(){
  const cur = User.find({}).cursor();
  let updated=0;
  for await (const u of cur) {
    const emailLower = normalizeEmail(u.email);
    const phoneNorm  = normalizePhone(u.phone);
    if (u.emailLower !== emailLower || u.phoneNorm !== phoneNorm) {
      if (!DRY) {
        u.emailLower = emailLower || undefined;
        u.phoneNorm = phoneNorm || undefined;
        await u.save();
      }
      updated++;
    }
  }
  console.log("normalized users:", updated);
}

async function dedupeByKey(field){
  // 同一 key のユーザー群をまとめて代表を残し、他を統合
  const pipeline = [
    { $match: { [field]: { $exists: true, $ne: null, $ne: "" } } },
    { $group: { _id: `$${field}`, users: { $push: { _id: "$_id", storeIds: "$storeIds", createdAt: "$createdAt" } }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ];
  const dupGroups = await User.aggregate(pipeline);
  let mergedGroups = 0, movedStaff = 0, deletedUsers = 0;

  for (const g of dupGroups) {
    const users = g.users.sort((a,b) => a._id.getTimestamp() - b._id.getTimestamp()); // 古いidを代表に
    const keeper = users[0];
    const losers = users.slice(1);

    const loserIds = losers.map(x => x._id);
    const loserDocs = await User.find({ _id: { $in: loserIds } }).lean();

    // storeIds の和集合
    const allStoreIds = new Set((keeper.storeIds || []).map(String));
    for (const l of loserDocs) (l.storeIds || []).forEach(s => allStoreIds.add(String(s)));

    if (!DRY) {
      // keeper.storeIds を更新
      await User.updateOne({ _id: keeper._id }, { $set: { storeIds: Array.from(allStoreIds).map(id => new mongoose.Types.ObjectId(id)) } });

      // staff.userId を keeper へ付け替え（重複があっても unique(storeId,userId) が守る）
      const r = await Staff.updateMany({ userId: { $in: loserIds } }, { $set: { userId: keeper._id } });
      movedStaff += r.modifiedCount;

      // loser user を削除
      const d = await User.deleteMany({ _id: { $in: loserIds } });
      deletedUsers += d.deletedCount;
    }

    mergedGroups++;
  }

  console.log(`dedupe ${field}: groups=${mergedGroups}, movedStaff=${movedStaff}, deletedUsers=${deletedUsers}`);
}

async function main(){
  await connectDB(process.env.MONGO_URI);
  await normalizeAllUsers();
  await dedupeByKey("emailLower");
  await dedupeByKey("phoneNorm");
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
