import mongoose from "mongoose";
import Staff from "../models/Staff.js";
import User from "../models/User.js";

// 正規化（V2でも使用）
function normalizeEmail(s){ return (s || "").trim().toLowerCase(); }
function normalizePhone(s){
  return (s || "")
    .replace(/[（）()　\s]/g, "")   // 空白・全角括弧など除去
    .replace(/[－ー―−﹣﹘]/g, "-")  // 全角ハイフン→半角
    .replace(/[^\d+]/g, "");        // 数字/先頭+ 以外除去
}

// 一覧（Userとjoin）
export async function listStaff(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const rows = await Staff.find({ storeId, role: { $ne: "admin" } }) // ← 追加
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();
    res.json(rows.map(x => ({ ...x, id: String(x._id) })));
  } catch (e) {
    next(e);
  }
}

// 一般ユーザー検索（メール/TEL/ユーザーID/正規化キー）
export async function searchUsers(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const or = [];
    if (mongoose.isValidObjectId(q)) or.push({ _id: q });
    or.push(
      { email: q },
      { phone: q },
      { emailLower: normalizeEmail(q) },
      { phoneNorm:  normalizePhone(q) },
    );
    const users = await User.find({ $or: or }).limit(20).lean();
    res.json(users.map(u => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      phone: u.phone,
      storeIds: (u.storeIds || []).map(String),
    })));
  } catch (e) { next(e); }
}

// 追加：User.storeIds に追加し、Staff を upsert
export async function createStaff(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { userId, displayName, accountName, role } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // User.storeIds に追加（重複なし）
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { storeIds: storeId } }
    );

    // Staff upsert（同一 store x user で一意）
    const doc = await Staff.findOneAndUpdate(
      { storeId, userId: user._id },
      {
        $setOnInsert: { storeId, userId: user._id },
        $set: {
          displayName: displayName ?? user.name ?? "",
          accountName: accountName ?? user.email ?? user.phone ?? "",
          role: role ?? "staff",
        },
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ id: String(doc._id) });
  } catch (e) { next(e); }
}

// 更新（表示名/アカウント名/role）
export async function updateStaff(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const s = await Staff.findOne({ _id: req.params.id, storeId });
    if (!s) return res.status(404).json({ message: "Not found" });

    // 🔒 admin の編集は禁止
    if (s.role === "admin") {
      return res.status(403).json({ message: "管理者のロールは変更できません" });
    }

    // 通常の更新処理
    const { name, email, phone, role, password } = req.body;
    if (name) s.displayName = name;        // ← displayName を変更
    if (email) s.accountName = email;      // ← accountName も必要なら変更
    if (phone) s.phone = phone;
    if (role) s.role = role;
    if (password) await s.setPassword(password);

    await s.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

// 削除：Staff削除 + User.storeIds から該当店舗を外す
export async function deleteStaff(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const s = await Staff.findOne({ _id: req.params.id, storeId });
    if (!s) return res.status(404).json({ message: "Not found" });

    // 🔒 admin の削除は禁止
    if (s.role === "admin") {
      return res.status(403).json({ message: "管理者は削除できません" });
    }

    await Staff.deleteOne({ _id: s._id });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
