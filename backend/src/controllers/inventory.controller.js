import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";

function getShopId(req) {
  return req.params.shopId || req.body.shopId || req.user?.storeId;
}

export async function getInventory(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const productId = req.params.productId;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    const doc = await Inventory.findOne({ shopId, productId }).lean();
    res.json(doc || null);
  } catch (err) {
    next(err);
  }
}

export async function upsertInventory(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const productId = req.params.productId;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    const payload = {
      stockQty: req.body.stockQty,
      lowStockThreshold: req.body.lowStockThreshold,
      hideWhenZero: req.body.hideWhenZero,
      lowStockNoteFlag: req.body.lowStockNoteFlag,
      uom: req.body.uom,
      lotNo: req.body.lotNo,
      expireAt: req.body.expireAt,
      sku: req.body.sku,
    };
    const doc = await Inventory.findOneAndUpdate(
      { shopId, productId },
      {
        $set: {
          ...payload,
          shopId,
          storeId: shopId,
          productId,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json(doc);
  } catch (err) {
    next(err);
  }
}
