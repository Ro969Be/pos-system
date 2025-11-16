import mongoose from "mongoose";
import Staff from "../models/Staff.js";
import Store from "../models/Store.js";
import BusinessUser from "../models/BusinessUser.js";
import User from "../models/User.js";
import { canonicalRole, roleRank } from "../utils/roles.js";

function rankOf(role){ return roleRank(role); }
const ALLOWED_STAFF_ROLES = [
  "AreaManager",
  "StoreManager",
  "SubManager",
  "FullTimeStaff",
  "PartTimeStaff",
];

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
    const myRole  = req.user.role || "customer";

    const rows = await Staff.aggregate([
      { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
      // 管理者は一覧から非表示
      { $match: { role: { $nin: ["admin", "Admin"] } } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: "$_id" },
          userId: { $toString: "$userId" },
          displayName: 1,
          accountName: 1,
          role: 1,
          userName: "$user.name",
          email: "$user.email",
          phone: "$user.phone",
        },
      },
    ]);
    const myRank = rankOf(myRole);
    const shaped = rows.map(r => {
      const targetRank = rankOf(r.role);
      const canEdit = targetRank < myRank;   // 下位のみ編集可
      const canDelete = targetRank < myRank; // 下位のみ削除可
      return { ...r, canEdit, canDelete };
     });

    shaped.sort((a, b) => {
      const ar = rankOf(a.role);
      const br = rankOf(b.role);
      if (ar !== br) return br - ar;
      return (a.displayName || "").localeCompare(b.displayName || "");
    });

    res.json(shaped);
  } catch (e) { next(e); }
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
    const myRole  = req.user.role;

    const { userId, displayName, accountName, role } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    let canonical = canonicalRole(role);
    if (role && !canonical) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!canonical) canonical = "FullTimeStaff";
    if (!ALLOWED_STAFF_ROLES.includes(canonical)) {
      return res.status(400).json({ message: "Role is not allowed" });
    }

    if (rankOf(canonical) >= rankOf(myRole)) {
      return res.status(403).json({ message: "自分と同等以上の権限は付与できません" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // User.storeIds に追加（重複なし）
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { storeIds: storeId, shopIds: storeId } }
    );

    // Staff upsert（同一 store x user で一意）
    const doc = await Staff.findOneAndUpdate(
      { storeId, userId: user._id },
      {
        $setOnInsert: { storeId, userId: user._id },
        $set: {
          displayName: displayName ?? user.name ?? "",
          accountName: accountName ?? user.email ?? user.phone ?? "",
          role: canonical,
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
    const myRole  = req.user.role;

    const s = await Staff.findOne({ _id: req.params.id, storeId });
    if (!s) return res.status(404).json({ message: "Not found" });

    // 🔒 admin の編集は禁止
    if (canonicalRole(s.role) === "Admin") {
      return res.status(403).json({ message: "管理者のロールは変更できません" });
    }

    if (rankOf(myRole) <= rankOf(s.role)) {
      return res.status(403).json({ message: "自分と同等以上の権限は編集できません" });
    }

    // 通常の更新処理
    const { name, email, phone, role } = req.body;

    if (role) {
      const canonical = canonicalRole(role);
      if (!canonical || !ALLOWED_STAFF_ROLES.includes(canonical)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (rankOf(canonical) >= rankOf(myRole)) {
        return res.status(403).json({ message: "自分と同等以上の権限に変更できません" });
      }
      s.role = canonical;
    }
    if (name) s.displayName = name;
    if (email) s.accountName = email;
    if (phone) s.phone = phone;
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
    const myRole  = req.user.role;

    const s = await Staff.findOne({ _id: req.params.id, storeId });
    if (!s) return res.status(404).json({ message: "Not found" });

    // 🔒 admin の削除は禁止
    if (canonicalRole(s.role) === "Admin") {
      return res.status(403).json({ message: "管理者は削除できません" });
    }

    if (rankOf(myRole) <= rankOf(s.role)) {
      return res.status(403).json({ message: "自分と同等以上の権限は削除できません" });
    }

    await Staff.deleteOne({ _id: s._id });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function listShopStaff(req, res, next) {
  try {
    const { shopId } = req.params;
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const shopObjectId = new mongoose.Types.ObjectId(shopId);
    const exists = await Store.exists({ _id: shopObjectId });
    if (!exists) {
      return res.status(404).json({ message: "Shop not found" });
    }
    const staffList = await buildShopStaffList(shopObjectId);
    res.json(staffList);
  } catch (e) {
    next(e);
  }
}

export async function addShopStaff(req, res, next) {
  try {
    const { shopId } = req.params;
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const shopObjectId = new mongoose.Types.ObjectId(shopId);
    const exists = await Store.exists({ _id: shopObjectId });
    if (!exists) {
      return res.status(404).json({ message: "Shop not found" });
    }
    const { userId, email, role } = req.body || {};
    if (!userId && !email) {
      return res.status(400).json({ message: "userId or email is required" });
    }
    let user = null;
    if (userId && mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId);
    }
    if (!user && email) {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Valid email is required" });
      }
      user = await User.findOne({ emailLower: normalizedEmail });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let canonical = canonicalRole(role);
    if (role && !canonical) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!canonical) canonical = "FullTimeStaff";
    if (!ALLOWED_STAFF_ROLES.includes(canonical)) {
      return res.status(400).json({ message: "Role is not allowed for staff" });
    }

    await User.updateOne(
      { _id: user._id },
      { $addToSet: { storeIds: shopObjectId, shopIds: shopObjectId } }
    );

    await Staff.findOneAndUpdate(
      { storeId: shopObjectId, userId: user._id },
      {
        $setOnInsert: { storeId: shopObjectId, userId: user._id },
        $set: {
          displayName: user.userName || user.name || "",
          accountName: user.email || user.phone || "",
          role: canonical,
          activeFlag: true,
        },
      },
      { upsert: true, new: true }
    );

    await BusinessUser.findOneAndUpdate(
      { userId: user._id },
      {
        $setOnInsert: {
          userId: user._id,
          businessName: user.userName || user.email || "Business User",
          role: canonical,
        },
        $set: {
          activeFlag: true,
          "roleBindings.$[target].role": canonical,
        },
        $addToSet: {
          roleBindings: { shopId: shopObjectId, role: canonical },
          shopIds: shopObjectId,
        },
      },
      {
        upsert: true,
        arrayFilters: [{ "target.shopId": shopObjectId }],
      }
    );

    const staffList = await buildShopStaffList(shopObjectId);
    res.status(201).json(staffList);
  } catch (e) {
    next(e);
  }
}

async function buildShopStaffList(shopId) {
  const shopObjectId =
    typeof shopId === "string" ? new mongoose.Types.ObjectId(shopId) : shopId;
  const shopIdString = shopObjectId.toString();
  const [bizUsers, staffAssignments] = await Promise.all([
    BusinessUser.find({
      activeFlag: { $ne: false },
      roleBindings: { $elemMatch: { shopId: shopObjectId } },
    }).lean(),
    Staff.find({ storeId: shopObjectId, activeFlag: { $ne: false } }).lean(),
  ]);

  const userIds = new Set();
  bizUsers.forEach((biz) => {
    if (biz?.userId) userIds.add(String(biz.userId));
  });
  staffAssignments.forEach((doc) => {
    if (doc?.userId) userIds.add(String(doc.userId));
  });
  if (!userIds.size) return [];

  const users = await User.find({ _id: { $in: Array.from(userIds) } })
    .select("userName name email phone")
    .lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));
  const merged = new Map();

  const touch = (userId, role) => {
    const canonical = canonicalRole(role) || "FullTimeStaff";
    const current = merged.get(userId);
    if (!current || rankOf(canonical) > rankOf(current.role)) {
      const user = userMap.get(userId);
      if (!user) return;
      merged.set(userId, {
        userId,
        name: user.userName || user.name || "",
        email: user.email || null,
        phone: user.phone || null,
        role: canonical,
      });
    }
  };

  bizUsers.forEach((biz) => {
    if (!biz?.userId) return;
    (biz.roleBindings || []).forEach((binding) => {
      if (String(binding.shopId) === shopIdString) {
        touch(String(biz.userId), binding.role);
      }
    });
  });

  staffAssignments.forEach((doc) => {
    touch(String(doc.userId), doc.role);
  });

  const list = Array.from(merged.values());
  list.sort((a, b) => {
    const diff = rankOf(b.role) - rankOf(a.role);
    if (diff !== 0) return diff;
    return (a.name || "").localeCompare(b.name || "");
  });
  return list;
}
