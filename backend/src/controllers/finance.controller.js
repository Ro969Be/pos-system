import mongoose from "mongoose";
import FLR from "../models/FLR.js";
import Expense from "../models/Expense.js";

function ensureShop(shopId) {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    const err = new Error("Invalid shopId");
    err.statusCode = 400;
    throw err;
  }
  return shopId;
}

export async function listFlr(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const docs = await FLR.find({ shopId }).sort({ date: -1 }).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function createFlr(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const doc = await FLR.create({
      shopId,
      storeId: shopId,
      date: req.body.date,
      amount: req.body.amount,
      description: req.body.description,
      createdBy: req.user?.userId,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function updateFlr(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const doc = await FLR.findOneAndUpdate(
      { _id: req.params.id, shopId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "FLR not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function deleteFlr(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const doc = await FLR.findOneAndDelete({ _id: req.params.id, shopId }).lean();
    if (!doc) return res.status(404).json({ message: "FLR not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function listExpense(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const docs = await Expense.find({ shopId }).sort({ incurredAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const doc = await Expense.create({
      shopId,
      storeId: shopId,
      category: req.body.category,
      amount: req.body.amount,
      memo: req.body.memo,
      incurredAt: req.body.incurredAt,
      createdBy: req.user?.userId,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function updateExpense(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const doc = await Expense.findOneAndUpdate(
      { _id: req.params.id, shopId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Expense not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const doc = await Expense.findOneAndDelete({ _id: req.params.id, shopId }).lean();
    if (!doc) return res.status(404).json({ message: "Expense not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
