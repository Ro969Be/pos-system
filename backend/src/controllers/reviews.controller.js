import mongoose from "mongoose";
import Review from "../models/Review.js";
import Photo from "../models/Photo.js";

function ensureShopId(req) {
  return req.params.shopId || req.user?.storeId;
}

export async function listReviews(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const reviews = await Review.find({ shopId })
      .sort({ createdAt: -1 })
      .lean();
    const ids = reviews.map((r) => r._id);
    const photos = await Photo.find({
      reviewId: { $in: ids },
    }).lean();
    const photoMap = new Map();
    photos.forEach((p) => {
      const key = String(p.reviewId);
      if (!photoMap.has(key)) photoMap.set(key, []);
      photoMap.get(key).push(p);
    });
    res.json(
      reviews.map((r) => ({
        ...r,
        photos: photoMap.get(String(r._id)) || [],
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const review = await Review.create({
      shopId,
      storeId: shopId,
      customerName: req.body.customerName,
      rating: req.body.rating,
      comment: req.body.comment,
      tags: req.body.tags || [],
      status: req.body.status || "published",
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

export async function updateReview(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    const reviewId = req.params.reviewId;
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, shopId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    const reviewId = req.params.reviewId;
    const review = await Review.findOneAndDelete({ _id: reviewId, shopId }).lean();
    if (!review) return res.status(404).json({ message: "Review not found" });
    await Photo.deleteMany({ reviewId: review._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function addPhoto(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    const reviewId = req.params.reviewId;
    const review = await Review.findOne({ _id: reviewId, shopId });
    if (!review) return res.status(404).json({ message: "Review not found" });
    const photo = await Photo.create({
      shopId,
      storeId: shopId,
      reviewId,
      url: req.body.url,
      caption: req.body.caption,
    });
    res.status(201).json(photo);
  } catch (err) {
    next(err);
  }
}
