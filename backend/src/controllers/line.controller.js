import mongoose from "mongoose";
import LineBroadcast from "../models/LineBroadcast.js";

function ensureShop(shopId) {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    const err = new Error("Invalid shopId");
    err.statusCode = 400;
    throw err;
  }
  return shopId;
}

export async function listBroadcasts(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const docs = await LineBroadcast.find({ shopId }).sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function createBroadcast(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const doc = await LineBroadcast.create({
      shopId,
      storeId: shopId,
      title: req.body.title,
      body: req.body.body,
      segments: req.body.segments || [],
      status: req.body.status || "draft",
      scheduledAt: req.body.scheduledAt,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function sendBroadcast(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const broadcast = await LineBroadcast.findOne({ _id: req.params.broadcastId, shopId });
    if (!broadcast) return res.status(404).json({ message: "Broadcast not found" });
    broadcast.status = "sent";
    broadcast.sentAt = new Date();
    broadcast.sentBy = req.user?.userId;
    broadcast.stats = { delivered: Math.floor(Math.random() * 1000), read: Math.floor(Math.random() * 800) };
    await broadcast.save();
    res.json(broadcast);
  } catch (err) {
    next(err);
  }
}
