// backend/scripts/seed.mjs
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import Store from "../src/models/Store.js";
import User from "../src/models/User.js";
import BusinessUser from "../src/models/BusinessUser.js";
import Staff from "../src/models/Staff.js";

const STORE_CODE = process.env.DEV_STORE_CODE || "DEV-001";
const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || "owner@example.com";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD || "owner123";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";

async function ensureStore() {
  let store = await Store.findOne({ code: STORE_CODE });
  if (!store) {
    store = await Store.create({
      name: "Dev Shop",
      code: STORE_CODE,
      type: "restaurant",
      settings: {
        sla: { food: 15, drink: 3, dessert: 10 },
        serviceStartHour: 0,
      },
    });
    console.log("🏪 created store:", store.name, String(store._id));
  } else {
    console.log("♻️  reuse store:", store.name, String(store._id));
  }
  return store;
}

async function upsertUser({ userName, email, phone, password }) {
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = new User({ userName, email, phone });
  } else {
    user.userName = userName;
    user.phone = phone;
  }
  await user.setPassword(password);
  await user.save();
  return user;
}

(async () => {
  await connectDB(process.env.MONGO_URI);
  try {
    const store = await ensureStore();

    const ownerUser = await upsertUser({
      userName: "Demo Owner",
      email: OWNER_EMAIL,
      phone: "0100000000",
      password: OWNER_PASSWORD,
    });
    await User.updateOne(
      { _id: ownerUser._id },
      { $addToSet: { storeIds: store._id, shopIds: store._id } }
    );

    let biz = await BusinessUser.findOne({ userId: ownerUser._id });
    if (!biz) {
      biz = new BusinessUser({
        userId: ownerUser._id,
        businessName: "Demo Holdings",
        role: "Owner",
        roleBindings: [{ shopId: store._id, role: "Owner" }],
      });
    } else {
      biz.businessName = "Demo Holdings";
      biz.role = "Owner";
      biz.roleBindings = [{ shopId: store._id, role: "Owner" }];
    }
    await biz.save();

    const adminUser = await upsertUser({
      userName: "Demo Admin",
      email: ADMIN_EMAIL,
      phone: "0100000001",
      password: ADMIN_PASSWORD,
    });
    await User.updateOne(
      { _id: adminUser._id },
      { $addToSet: { storeIds: store._id, shopIds: store._id } }
    );

    await Staff.findOneAndUpdate(
      { storeId: store._id, userId: adminUser._id },
      {
        $setOnInsert: { displayName: "Demo Admin", accountName: ADMIN_EMAIL },
        $set: { role: "Admin", employmentType: "FullTime", activeFlag: true },
      },
      { upsert: true, new: true }
    );

    console.log("✅ Seeded owner/admin accounts.");
    console.log(`Owner login: ${OWNER_EMAIL} / ${OWNER_PASSWORD}`);
    console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`Store ID: ${String(store._id)} (code: ${store.code})`);
    console.log("\nUseful DEV env vars:");
    console.log("DEV_BYPASS_AUTH=1");
    console.log(`DEV_STORE_ID=${String(store._id)}`);
    console.log(`DEV_STORE_CODE=${STORE_CODE}`);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();
