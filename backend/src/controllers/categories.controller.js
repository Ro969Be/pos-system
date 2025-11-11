import mongoose from "mongoose";
import MenuCategory from "../models/MenuCategory.js";

function getShopId(req) {
  return req.params.shopId || req.body.shopId || req.user?.storeId;
}

export async function listCategories(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const docs = await MenuCategory.find({ shopId })
      .sort({ orderNo: 1, createdAt: 1 })
      .lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const { name, type = "Food", orderNo = 0, activeFlag = true } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });
    const doc = await MenuCategory.create({
      shopId,
      storeId: shopId,
      name,
      type,
      orderNo,
      activeFlag,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const doc = await MenuCategory.findOneAndUpdate(
      { _id: req.params.categoryId || req.params.id, shopId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Category not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const doc = await MenuCategory.findOneAndDelete({
      _id: req.params.categoryId || req.params.id,
      shopId,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Category not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
