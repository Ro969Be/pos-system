// backend/src/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";
import Store from "../models/Store.js";
import bcrypt from "bcryptjs";

function sign(staff) {
  return jwt.sign(
    { staffId: staff._id, role: staff.role, storeId: staff.storeId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function registerStaff(req, res, next) {
  try {
    const { storeCode, name, email, phone, password, role = "staff" } = req.body;
    const store = await Store.findOne({ code: storeCode });
    if (!store) return res.status(400).json({ message: "Store not found" });

    const exists = await Staff.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const staff = new Staff({ storeId: store._id, name, email, phone, role, passwordHash: "" });
    await staff.setPassword(password);
    await staff.save();
    res.status(201).json({ id: staff._id });
  } catch (e) { next(e); }
}

export async function registerOwner(req, res, next) {
  try {
    const { storeCode, name, email, phone, password } = req.body;
    const store = await Store.findOne({ code: storeCode });
    if (!store) return res.status(400).json({ message: "Store not found" });
    const exists = await Staff.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const staff = new Staff({ storeId: store._id, name, email, phone, role: "owner", passwordHash: "" });
    await staff.setPassword(password);
    await staff.save();

    const token = sign(staff);
    res.status(201).json({ token });
  } catch (e) { next(e); }
}

export async function registerAdmin(req, res, next) {
  try {
    // セットアップトークンで保護
    if (!process.env.ADMIN_SETUP_TOKEN || req.body.setupToken !== process.env.ADMIN_SETUP_TOKEN) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { storeCode, name, email, phone, password } = req.body;

    // ★ 店舗が無ければ自動作成（初期セットアップを詰まらせない）
    let store = await Store.findOne({ code: storeCode });
    if (!store) {
      store = await Store.create({
        name: storeCode,
        code: storeCode,
        settings: { serviceStartHour: 0, sla: { drink: 3, food: 15, dessert: 7 } },
      });
    }

    const exists = await Staff.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const staff = new Staff({ storeId: store._id, name, email, phone, role: "admin", passwordHash: "" });
    await staff.setPassword(password);
    await staff.save();

    const token = jwt.sign(
      { staffId: staff._id, role: staff.role, storeId: staff.storeId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({ token });
  } catch (e) { next(e); }
}


export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await staff.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = sign(staff);
    res.json({ token });
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try {
    const s = await Staff.findById(req.user.staffId).lean();
    if (!s) return res.status(404).json({ message: "User not found" });
    const store = await Store.findById(s.storeId).lean();

    const basePerms = ["kitchen.view","hall.view","pos.view","pos.checkout","sales.view"];
    const rolePerms = {
      staff: ["kitchen.view","hall.view","pos.view"],
      manager: basePerms,
      owner: basePerms,
      area_manager: basePerms,
      admin: basePerms, // admin=全権限（必要に応じて拡張）
    };

    res.json({
      id: String(s._id),
      name: s.name,
      email: s.email,
      role: s.role,
      storeId: String(s.storeId),
      store: store ? { id: String(store._id), name: store.name, code: store.code } : null,
      permissions: rolePerms[s.role] || [],
    });
  } catch (e) { next(e); }
}

export async function updateMe(req, res, next) {
  try {
    const { name, phone } = req.body;
    const s = await Staff.findById(req.user.staffId);
    if (!s) return res.status(404).json({ message: "User not found" });

    if (typeof name === "string")  s.name  = name;
    if (typeof phone === "string") s.phone = phone;
    await s.save();

    const store = await Store.findById(s.storeId).lean();
    const basePerms = ["kitchen.view","hall.view","pos.view","pos.checkout","sales.view"];
    const rolePerms = { staff:["kitchen.view","hall.view","pos.view"], manager:basePerms, owner:basePerms, area_manager:basePerms, admin:basePerms };

    res.json({
      id:String(s._id),
      name:s.name, email:s.email, role:s.role,
      store: store ? { id:String(store._id), name:store.name, code:store.code } : null,
      permissions: rolePerms[s.role] || [],
    });
  } catch (e) { next(e); }
}
