import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../db.js";

import User from "../src/models/User.js";
import Staff from "../src/models/Staff.js";
import Store from "../src/models/Store.js";
import Category from "../src/models/Category.js";
import Register from "../src/models/Register.js";
import MobileOrderSetting from "../src/models/MobileOrderSetting.js";
import Table from "../src/models/Table.js";
import { canonicalRole } from "../src/utils/roles.js";

// Business ログイン（既存の business login / select-store を活かすなら）
import Business from "../src/models/Business.js";
import bcrypt from "bcryptjs";

// ---- ユーティリティ
function emailOf(name, i){ return `${name}${i}@example.com`.toLowerCase(); }
function phoneOf(i){ return `0900000${(1000+i).toString().slice(-4)}`; }
function pick(arr, i){ return arr[i % arr.length]; }

async function createBusiness(loginId, password, orgName){
  const exists = await Business.findOne({ loginId });
  if (exists) return exists;
  const hash = await bcrypt.hash(password, 10);
  return Business.create({ loginId, passwordHash: hash, orgName, name: orgName });
}

async function main(){
  await connectDB(process.env.MONGO_URI);

  // ====== 全消し（関係の深い順に）======
  await Promise.all([
    Staff.deleteMany({}),
    User.deleteMany({}),
    Store.deleteMany({}),
    Category.deleteMany({}),
    Register.deleteMany({}),
    MobileOrderSetting.deleteMany({}),
    Table.deleteMany({}),
    Business.deleteMany({}),
  ]);
  console.log("🧹 Cleared collections.");

  // ====== 店舗 8件作成 ======
  const storeTypes = [
    "webshop", "webshop",        // 2
    "salon", "salon", "salon", // 3
    "restaurant", "restaurant", "restaurant" // 3
  ];
  const storePayloads = storeTypes.map((type, i) => ({
    name: `デモ店舗 ${i+1}`,
    code: `DEMO-${String(i+1).padStart(3, "0")}`,
    type,
    phone: `03-0000-00${String(i+1).padStart(2, "0")}`,
    address: `東京都テスト区${i+1}-1-1`,
    settings: { serviceStartHour: 0, sla: {} },
  }));
  const stores = await Store.insertMany(storePayloads);
  console.log(`🏬 Stores: ${stores.length}`);

  // ====== Business（オーナーがログインできる用）2件 ======
  // ※ 既存の business login / select-store フローを活かすため
  const biz1 = await createBusiness("owner1", "owner1", "オーナー1社");
  const biz2 = await createBusiness("owner2", "owner2", "オーナー2社");

  // Store を2人のオーナーに分配
  // （Store には businessId をもたせている前提。無ければこのsetはスキップしてOK）
  const half = Math.floor(stores.length / 2);
  const sGroup1 = stores.slice(0, half);
  const sGroup2 = stores.slice(half);
  await Promise.all([
    Store.updateMany({ _id: { $in: sGroup1.map(s=>s._id) } }, { $set: { businessId: biz1._id } }),
    Store.updateMany({ _id: { $in: sGroup2.map(s=>s._id) } }, { $set: { businessId: biz2._id } }),
  ]);
  console.log("🔗 Linked stores to business owners (owner1/owner2).");

  // ====== Users 47件作成（ロール構成に合わせる） ======
  // 1 admin / 2 owner / 3 area mgr / 8 store mgr / 8 sub mgr / 15 full-time staff / 10 part-time staff
  const rolePlan = [
    ...Array(1).fill("admin"),
    ...Array(2).fill("owner"),
    ...Array(3).fill("area_manager"),
    ...Array(8).fill("store_manager"),
    ...Array(8).fill("sub_manager"),
    ...Array(15).fill("full_time_staff"),
    ...Array(10).fill("part_time_staff"),
  ];
  if (rolePlan.length !== 47) throw new Error("role plan total must be 47");

  const users = [];
  for (let i=0;i<rolePlan.length;i++){
    const role = rolePlan[i];
    users.push({
      name: `${role.replace(/_/g," ")}-${i+1}`,
      email: emailOf(role, i+1),
      phone: phoneOf(i+1),
      emailLower: emailOf(role, i+1),
      phoneNorm: phoneOf(i+1),
      storeIds: [], // 後で付与
    });
  }
  const createdUsers = await User.insertMany(users);
  console.log(`👤 Users: ${createdUsers.length}`);

  // ====== スタッフ配置ポリシー ======
  // - admin: 全店舗にアクセス可能 → 各店舗に Staff としても置く
  // - owner: 自分の business に紐づく店舗（複数）へ配置
  // - area_manager: 複数店舗へ（ここでは 2〜3店舗程度を割当）
  // - store_manager / sub_manager / full_time_staff / part_time_staff:
  //   → 単一店舗へ割当（ full_time_staff/part_time_staff は各店舗に複数散らす ）

  // 役割別ユーザー配列
  const byRole = rolePlan.reduce((acc, r, i) => {
    acc[r] ??= [];
    acc[r].push(createdUsers[i]);
    return acc;
  }, {});

  const staffDocs = [];

  // 1) admin（全店舗へ）
  for (const u of byRole["admin"] || []) {
    for (const st of stores) {
      staffDocs.push({
        storeId: st._id,
        userId: u._id,
        role: canonicalRole("admin") || "Admin",
        displayName: u.name,
        accountName: u.email,
      });
      u.storeIds.push(st._id);
    }
  }

  // 2) owner（biz1→前半店舗、biz2→後半店舗）
  const owners = byRole["owner"] || [];
  const ownersGroups = [sGroup1, sGroup2];
  owners.forEach((u, idx) => {
    const myStores = ownersGroups[idx % ownersGroups.length];
    myStores.forEach(st => {
      staffDocs.push({
        storeId: st._id,
        userId: u._id,
        role: canonicalRole("owner") || "Owner",
        displayName: u.name,
        accountName: u.email,
      });
      u.storeIds.push(st._id);
    });
  });

  // 3) area_manager（各人に2〜3店舗）
  for (const u of byRole["area_manager"] || []) {
    const k = 2 + (u._id.getTimestamp().getTime() % 2); // 2 or 3
    for (let i=0;i<k;i++){
      const st = stores[(u._id.getTimestamp().getTime() + i) % stores.length];
      staffDocs.push({
        storeId: st._id,
        userId: u._id,
        role: canonicalRole("area_manager") || "AreaManager",
        displayName: u.name,
        accountName: u.email,
      });
      u.storeIds.push(st._id);
    }
  }

  // 4) store_manager（各人 1店舗）
  for (const u of byRole["store_manager"] || []) {
    const st = stores[u._id.getTimestamp().getTime() % stores.length];
    staffDocs.push({
      storeId: st._id,
      userId: u._id,
      role: canonicalRole("store_manager") || "StoreManager",
      displayName: u.name,
      accountName: u.email,
    });
    u.storeIds.push(st._id);
  }

  // 5) sub_manager（各人 1店舗）
  for (const u of byRole["sub_manager"] || []) {
    const st = stores[(u._id.getTimestamp().getTime()+1) % stores.length];
    staffDocs.push({
      storeId: st._id,
      userId: u._id,
      role: canonicalRole("sub_manager") || "SubManager",
      displayName: u.name,
      accountName: u.email,
    });
    u.storeIds.push(st._id);
  }

  // 6) full_time_staff（各人 1店舗、全店舗にまんべんなく）
  for (let i=0; i<(byRole["full_time_staff"]||[]).length; i++){
    const u = byRole["full_time_staff"][i];
    const st = stores[i % stores.length];
    staffDocs.push({
      storeId: st._id,
      userId: u._id,
      role: canonicalRole("full_time_staff") || "FullTimeStaff",
      displayName: u.name,
      accountName: u.email,
    });
    u.storeIds.push(st._id);
  }

  // 7) part_time_staff（各人 1店舗、full_time_staff と似た配分）
  for (let i=0; i<(byRole["part_time_staff"]||[]).length; i++){
    const u = byRole["part_time_staff"][i];
    const st = stores[(i+3) % stores.length];
    staffDocs.push({
      storeId: st._id,
      userId: u._id,
      role: canonicalRole("part_time_staff") || "PartTimeStaff",
      displayName: u.name,
      accountName: u.email,
    });
    u.storeIds.push(st._id);
  }

  await Staff.insertMany(staffDocs);
  // users の storeIds をまとめて反映
  await Promise.all(createdUsers.map(u => User.updateOne({ _id: u._id }, { $set: { storeIds: [...new Set(u.storeIds)] } })));
  console.log(`👥 Staffs: ${staffDocs.length}`);

  // ====== 付帯データ（カテゴリ/メニュー/テーブル/レジ/モバイル設定）ざっくり投入 ======
  for (const st of stores) {
    await Category.insertMany([
      { storeId: st._id, name: "前菜", isActive: true },
      { storeId: st._id, name: "ドリンク", isActive: true },
      { storeId: st._id, name: "デザート", isActive: true },
    ]);

    await Table.insertMany([
      { storeId: st._id, name: "T-1", capacity: 2 },
      { storeId: st._id, name: "T-2", capacity: 4 },
      { storeId: st._id, name: "C-1", capacity: 1 },
    ]);

    await Register.insertMany([
      { storeId: st._id, name: "レジ1", pass: "0000", taxMode: "standard", printerIP: "192.168.0.10" },
    ]);

    await MobileOrderSetting.create({ storeId: st._id, enabled: true, pickupEnabled: true, deliveryEnabled: false, note: "" });
  }
  console.log("🧩 Basic store settings seeded (categories/registers/tables/mobile).");

  // 終了ログ
  console.log("✅ Seed completed.");
  console.log("   admin login (dummy): (no password needed in this flow)");
  console.log("   business owners:");
  console.log("     - loginId: owner1 / password: owner1");
  console.log("     - loginId: owner2 / password: owner2");
  console.log("   stores:", stores.map(s => `${s.name}(${s.type})`).join(", "));
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
