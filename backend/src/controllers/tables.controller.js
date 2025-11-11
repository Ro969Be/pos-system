import mongoose from "mongoose";
import Table from "../models/Table.js";

function resolveShopId(req) {
  return (
    req.params.shopId ||
    req.body.shopId ||
    req.query.shopId ||
    req.user?.storeId
  );
}

function tableFilter(shopId) {
  if (!shopId || !mongoose.isValidObjectId(shopId)) return null;
  const id = new mongoose.Types.ObjectId(shopId);
  return {
    $or: [{ shopId: id }, { storeId: id }],
  };
}

function scrubTableBody(body = {}) {
  const allowed = [
    "tableName",
    "name",
    "floor",
    "area",
    "capacity",
    "type",
    "isPrivate",
    "isSmoking",
    "color",
    "activeFlag",
  ];
  const payload = {};
  allowed.forEach((key) => {
    if (body[key] !== undefined) payload[key] = body[key];
  });
  return payload;
}

export async function listTables(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    const criteria = tableFilter(shopId);
    if (!criteria) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const docs = await Table.find(criteria).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function createTable(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId) return res.status(400).json({ message: "shopId required" });
    const criteria = tableFilter(shopId);
    if (!criteria) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const payload = scrubTableBody(req.body);
    if (!payload.tableName && !payload.name) {
      return res.status(400).json({ message: "tableName is required" });
    }
    if (!payload.capacity) {
      return res.status(400).json({ message: "capacity is required" });
    }
    const doc = await Table.create({
      ...payload,
      shopId,
      storeId: shopId,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function updateTable(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    const criteria = tableFilter(shopId);
    if (!criteria) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const payload = scrubTableBody(req.body);
    const doc = await Table.findOneAndUpdate(
      { _id: req.params.tableId || req.params.id, ...criteria },
      { $set: payload },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Table not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function deleteTable(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    const criteria = tableFilter(shopId);
    if (!criteria) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const doc = await Table.findOneAndDelete({
      _id: req.params.tableId || req.params.id,
      ...criteria,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Table not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function lockTable(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    const tableId = req.params.tableId;
    const criteria = tableFilter(shopId);
    if (!criteria) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const { action = "lock", holdMinutes = 15, note } = req.body || {};
    const table = await Table.findOne({
      _id: tableId,
      ...criteria,
    });
    if (!table) return res.status(404).json({ message: "Table not found" });

    const now = new Date();
    const expiresAt = table.lock?.expiresAt;
    const isExpired = expiresAt && expiresAt <= now;

    if (action === "unlock") {
      table.lock = undefined;
      await table.save();
      return res.json({ ok: true, lock: table.lock });
    }

    if (table.lock && !isExpired) {
      return res
        .status(409)
        .json({ message: "Table already locked", lock: table.lock });
    }

    const expires =
      holdMinutes > 0
        ? new Date(now.getTime() + Math.min(holdMinutes, 120) * 60000)
        : new Date(now.getTime() + 15 * 60000);

    table.lock = {
      lockedBy: req.user?.userId || req.user?.staffId || "system",
      lockedAt: now,
      note,
      expiresAt: expires,
    };
    await table.save();
    res.json({ ok: true, lock: table.lock });
  } catch (err) {
    next(err);
  }
}
