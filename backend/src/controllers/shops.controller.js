import mongoose from "mongoose";
import Shop from "../models/Shop.js";

function allowedShopFilter(req) {
  const roles = req.user?.roles || [];
  if (roles.includes("Admin")) return {};
  const bindings = (req.user?.bindings || [])
    .map((b) => b.shopId && new mongoose.Types.ObjectId(b.shopId))
    .filter(Boolean);
  if (!bindings.length) {
    return { _id: { $in: [] } };
  }
  return { _id: { $in: bindings } };
}

function sanitizePayload(body = {}) {
  const fields = [
    "shopName",
    "code",
    "shopKind",
    "station",
    "genre",
    "businessHours",
    "businessDays",
    "regularHoliday",
    "address",
    "access",
    "payments",
    "phone",
    "email",
    "tables",
    "facilities",
    "reservationPolicy",
    "calendarRule",
    "googleCalendarSync",
    "rating",
    "budgetLunch",
    "budgetDinner",
    "activeFlag",
  ];
  const payload = {};
  fields.forEach((key) => {
    if (body[key] !== undefined) payload[key] = body[key];
  });
  return payload;
}

export async function listShops(req, res, next) {
  try {
    const filter = { activeFlag: { $ne: false }, ...allowedShopFilter(req) };
    const docs = await Shop.find(filter).sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function createShop(req, res, next) {
  try {
    const payload = sanitizePayload(req.body);
    if (!payload.shopName) {
      return res.status(400).json({ message: "shopName is required" });
    }
    payload.ownerUserId = req.user?.userId;
    const doc = await Shop.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Shop code already exists" });
    }
    next(err);
  }
}

export async function updateShop(req, res, next) {
  try {
    const payload = sanitizePayload(req.body);
    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: "No fields to update" });
    }
    const filter = {
      _id: req.params.id,
      ...allowedShopFilter(req),
    };
    const doc = await Shop.findOneAndUpdate(filter, { $set: payload }, { new: true }).lean();
    if (!doc) return res.status(404).json({ message: "Shop not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function deleteShop(req, res, next) {
  try {
    const filter = {
      _id: req.params.id,
      ...allowedShopFilter(req),
    };
    const doc = await Shop.findOneAndDelete(filter).lean();
    if (!doc) return res.status(404).json({ message: "Shop not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
