// backend/scripts/migrate-staff-to-user.mjs
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../db.js";

// ==== Models (新仕様) ====
import User from "../src/models/User.js";
import Staff from "../src/models/Staff.js";

// 実行オプション
const DRY_RUN = process.env.DRY_RUN === "1";      // 1 だと書き込みせずログのみ
const FILL_USER_STORE_ID = process.env.FILL_USER_STORE_ID !== "0"; // true: user.storeId も埋める

function log(...args) {
  console.log(...args);
}

async function main() {
  await connectDB(process.env.MONGO_URI);

  // 対象: userId が空の Staff を全件
  const cursor = Staff.find({ $or: [{ userId: null }, { userId: { $exists: false } }] }).cursor();

  let touched = 0;
  let createdUsers = 0;
  let linkedStaffs = 0;
  let skipped = 0;

  for await (const s of cursor) {
    touched++;

    const storeId = s.storeId?.toString();
    const { email, phone } = s;

    // マッチ基準: email > phone（無ければスキップ）
    if (!email && !phone) {
      skipped++;
      log(`⏭️  skip (no email/phone) staffId=${s._id} name=${s.name}`);
      continue;
    }

    // 1) 既存 User を探す
    let user = null;
    if (email) user = await User.findOne({ email });
    if (!user && phone) user = await User.findOne({ phone });

    // 2) なければ作る（最小項目）
    if (!user) {
      const payload = {
        name: s.name || "",
        email: email || undefined,
        phone: phone || undefined,
        // storeId は後で埋める
      };
      if (!DRY_RUN) {
        user = await User.create(payload);
      } else {
        user = new User(payload);
        user._id = new mongoose.Types.ObjectId(); // 仮
      }
      createdUsers++;
      log(`🆕 create User id=${user._id} from Staff id=${s._id} email=${email} phone=${phone}`);
    }

    // 3) User.storeId を（必要なら）埋める
    if (FILL_USER_STORE_ID) {
      const userStore = user.storeId ? user.storeId.toString() : null;
      if (!userStore || userStore !== storeId) {
        if (!DRY_RUN) {
          user.storeId = s.storeId;
          await user.save();
        }
        log(`🔗 set user.storeId=${storeId} (userId=${user._id})`);
      }
    }

    // 4) Staff.userId を埋める（新方式のコア）
    if (!s.userId || s.userId.toString() !== user._id.toString()) {
      if (!DRY_RUN) {
        s.userId = user._id;
        await s.save();
      }
      linkedStaffs++;
      log(`✅ link Staff(${s._id}) -> User(${user._id})`);
    }
  }

  log("\n==== SUMMARY ====");
  log(`touched Staff : ${touched}`);
  log(`created Users : ${createdUsers}`);
  log(`linked Staffs : ${linkedStaffs}`);
  log(`skipped (no email/phone): ${skipped}`);
}

main()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
