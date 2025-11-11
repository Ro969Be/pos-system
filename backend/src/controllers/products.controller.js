import mongoose from "mongoose";
import Product from "../models/Product.js";
import MenuCategory from "../models/MenuCategory.js";

function getShopId(req) {
  return req.params.shopId || req.body.shopId || req.user?.storeId;
}

async function ensureCategory(shopId, categoryId) {
  if (!categoryId) return false;
  const exists = await MenuCategory.exists({ _id: categoryId, shopId });
  return !!exists;
}

export async function listProducts(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const docs = await Product.find({ shopId }).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const {
      categoryId,
      name,
      price,
      description,
      taxClass,
      kdsStation,
      stdPrepSeconds,
      activeFlag = true,
      sku,
      allergens,
      images,
      availabilityWindow,
      variations,
    } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: "name and price are required" });
    }
    if (!categoryId || !(await ensureCategory(shopId, categoryId))) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const doc = await Product.create({
      shopId,
      storeId: shopId,
      categoryId,
      name,
      price,
      description,
      taxClass,
      kdsStation,
      stdPrepSeconds,
      activeFlag,
      sku,
      allergens,
      images,
      availabilityWindow,
      variations,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const payload = { ...req.body };
    if (payload.categoryId && !(await ensureCategory(shopId, payload.categoryId))) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }
    const doc = await Product.findOneAndUpdate(
      { _id: req.params.productId || req.params.id, shopId },
      { $set: payload },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Product not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const shopId = getShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const doc = await Product.findOneAndDelete({
      _id: req.params.productId || req.params.id,
      shopId,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
