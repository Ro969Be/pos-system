// backend/scripts/seed.mjs
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import Store from "../src/models/Store.js";
import Ticket from "../src/models/Ticket.js";

const STORE_CODE = process.env.DEV_STORE_CODE || "DEV-001";

(async () => {
  await connectDB(process.env.MONGO_URI);
  try {
    // 1) Store を code で検索 → なければ作成（冪等）
    let store = await Store.findOne({ code: STORE_CODE });
    if (!store) {
      store = await Store.create({
        name: "Dev Store",
        code: STORE_CODE,
        settings: {
          sla: { food: 15, drink: 3, dessert: 10 },
          serviceStartHour: 0,
        },
      });
      console.log("🆕 created storeId:", String(store._id));
    } else {
      console.log("♻️  reuse storeId:", String(store._id));
    }

    // 2) 既存 Ticket を掃除（同じ store のみ）
    const del = await Ticket.deleteMany({ storeId: store._id });
    console.log(`🧹 cleared tickets: ${del.deletedCount}`);

    // 3) Ticket を投入（tableId は ObjectId）
    const now = new Date();
    const tableObjectId = new mongoose.Types.ObjectId();
    const base = {
      storeId: store._id,
      orderId: new mongoose.Types.ObjectId(),
      orderItemIndex: 0,
      tableId: tableObjectId, // ← ObjectId
      qty: 1,
      timestamps: { createdAt: now },
    };

    const docs = await Ticket.insertMany([
      {
        ...base,
        menuItemId: new mongoose.Types.ObjectId(),
        name: "生ビール",
        category: "drink",
        prepMinutes: 3,
        status: "PENDING",
      },
      {
        ...base,
        menuItemId: new mongoose.Types.ObjectId(),
        name: "唐揚げ",
        category: "food",
        prepMinutes: 12,
        status: "COOKING",
        timestamps: { ...base.timestamps, startedAt: now },
      },
      {
        ...base,
        menuItemId: new mongoose.Types.ObjectId(),
        name: "プリン",
        category: "dessert",
        prepMinutes: 8,
        status: "READY",
        timestamps: { ...base.timestamps, readyAt: now },
      },
    ]);

    console.log("✅ seed done");
    console.log("storeId:", String(store._id));
    console.log(
      "sample ticket ids:",
      docs.map((d) => String(d._id)).join(", ")
    );
    console.log("\n※ .env に以下を設定しておくと便利です：");
    console.log("DEV_BYPASS_AUTH=1");
    console.log(`DEV_STORE_ID=${String(store._id)}`);
    console.log(`DEV_STORE_CODE=${STORE_CODE}`);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();
