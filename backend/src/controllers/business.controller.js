import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

import Business from "../models/Business.js";
import Store from "../models/Store.js";
import OneTimeToken from "../models/OneTimeToken.js";
import User from "../models/User.js";

const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:5173";

function issueBusinessToken(biz) {
  // ビジネス段階トークン（店舗未選択）
  return jwt.sign(
    { businessId: String(biz._id), role: "owner" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function issueStoreToken(payload) {
  return jwt.sign(
    { staffId: null, role: payload.role || "owner", storeId: payload.storeId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

/**
 * 誰でもオーナー登録可能。
 * - ログイン中：req.user._id をそのまま Business.userId に使用
 * - 未ログイン：最小情報から User を作成して Business.userId に使用
 * Body: { orgName, name?, email?, phone? }
 */
export async function registerOwnerAny(req, res, next) {
  try {
    const { orgName, name, email, phone } = req.body || {};
    if (!orgName) return res.status(400).json({ message: "orgName is required" });

    let userId = req.user?._id;
    if (!userId) {
      const u = await User.create({
        name: name || "",
        email: email || undefined,
        phone: phone || undefined,
      });
      userId = u._id;
    }

    // 1ユーザー=1ビジネス
    const exists = await Business.findOne({ userId });
    if (exists) return res.status(409).json({ message: "既にBusinessが存在します" });

    const biz = await Business.create({
      userId,
      orgName,
      loginId: String(userId), // 以後の“ビジネスID”は userId 文字列に統一
      email: email || undefined,
      phone: phone || undefined,
    });

    // パス設定リンクを発行（本番はメール/SMSで送る）
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30分
    await OneTimeToken.create({
      kind: "business_set_password",
      businessId: biz._id,
      token,
      expiresAt,
    });

    res.status(201).json({
      id: String(biz._id),
      businessLoginId: String(userId),      // ← これを“ビジネスID”としてログイン画面に表示
      setPasswordUrl: `${APP_ORIGIN}/store-auth/set-password?token=${token}`,
      expiresAt,
    });
  } catch (e) { next(e); }
}

/** 一般ユーザーでログイン中に、ビジネス用パス設定リンクを再発行 */
export async function requestBusinessPasswordLink(req, res, next) {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "login required" });
    const biz = await Business.findOne({ userId: req.user._id });
    if (!biz) return res.status(404).json({ message: "Businessがありません" });

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await OneTimeToken.create({
      kind: "business_set_password",
      businessId: biz._id,
      token,
      expiresAt,
    });

    res.json({
      ok: true,
      url: `${APP_ORIGIN}/store-auth/set-password?token=${token}`,
      expiresAt,
    });
  } catch (e) { next(e); }
}

/** ワンタイムリンクからビジネス用パスを設定 */
export async function setBusinessPassword(req, res, next) {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ message: "token/password required" });

    const t = await OneTimeToken.findOne({
      token,
      kind: "business_set_password",
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });
    if (!t) return res.status(400).json({ message: "トークンが無効か期限切れです" });

    const biz = await Business.findById(t.businessId);
    if (!biz) return res.status(404).json({ message: "Business not found" });

    await biz.setPassword(password);
    await biz.save();

    t.usedAt = new Date();
    await t.save();

    res.json({ ok: true });
  } catch (e) { next(e); }
}

/**
 * 互換ログイン：
 * - 新方式 … loginId に userId 文字列を入れて運用
 * - 旧方式 … owner1 等の loginId でも引き続きログイン可能
 * Body: { loginId, password }
 */
export async function businessLogin(req, res, next) {
  try {
    const { loginId, password } = req.body;
    let biz = null;

    // まずは loginId 完全一致
    biz = await Business.findOne({ loginId });

    // ObjectId 文字列が来たら userId でも検索（新方式）
    if (!biz && mongoose.isValidObjectId(loginId)) {
      biz = await Business.findOne({ userId: loginId });
    }

    if (!biz || !biz.passwordHash) return res.status(401).json({ message: "Invalid login" });
    const ok = await biz.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid login" });

    const stores = await Store.find({ businessId: biz._id }).sort({ createdAt: 1 }).lean();
    const token = issueBusinessToken(biz);

    res.json({
      token,
      stores: stores.map(s => ({
        id: String(s._id),
        name: s.name,
        code: s.code,
        type: s.type,
      })),
    });
  } catch (e) { next(e); }
}

export async function selectStore(req, res, next) {
  try {
    const { storeId } = req.body;
    const bizId = req.user.businessId; // requireBusinessAuth がセット

    const store = await Store.findOne({ _id: storeId, businessId: bizId }).lean();
    if (!store) return res.status(404).json({ message: "Store not found" });

    const token = jwt.sign(
      { storeId: store._id, role: "owner" }, // 必要なら role を可変に
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
  } catch (e) { next(e); }
}
