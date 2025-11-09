import jwt from "jsonwebtoken";
import Business from "../models/Business.js";
import Store from "../models/Store.js";
import bcrypt from "bcryptjs";

function issueBusinessToken(biz) {
  // ビジネス段階トークン（店舗未選択）
  return jwt.sign(
    { businessId: String(biz._id), role: "owner" },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

function issueStoreToken(payload) {
  // 店舗選択後のスコープトークン（既存ミドルウェア互換）
  // staffId は無しでもOK。role と storeId を入れておく。
  return jwt.sign(
    { staffId: null, role: payload.role || "owner", storeId: payload.storeId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function businessLogin(req, res, next) {
  try {
    const { loginId, password } = req.body;
    const biz = await Business.findOne({ loginId });
    if (!biz) return res.status(401).json({ message: "Invalid login" });
    const ok = await biz.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid login" });

    const stores = await Store.find({ businessId: biz._id })
      .sort({ createdAt: 1 })
      .lean();
    const token = issueBusinessToken(biz);

    res.json({
      token,
      stores: stores.map((s) => ({
        id: String(s._id),
        name: s.name,
        code: s.code,
        type: s.type,
      })),
    });
  } catch (e) {
    next(e);
  }
}

export async function selectStore(req, res, next) {
  try {
    const { storeId } = req.body;
    const bizId = req.user.businessId; // requireBusinessAuth がセット

    // 所属チェック：この business のストアか？
    const store = await Store.findOne({
      _id: storeId,
      businessId: bizId,
    }).lean();
    if (!store) return res.status(404).json({ message: "Store not found" });

    // 店舗スコープJWTを発行（ここが肝）
    const token = jwt.sign(
      {
        storeId: store._id, // ← 必ず選択した storeId を入れる
        role: "manager", // もしくは owner/admin など必要権限
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      store: {
        id: String(store._id),
        name: store.name,
        code: store.code,
        type: store.type,
      },
    });
  } catch (e) {
    next(e);
  }
}
