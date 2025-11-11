import mongoose from "mongoose";
import Coupon from "../models/Coupon.js";
import CouponRedemption from "../models/CouponRedemption.js";

function ensureShopId(req) {
  return req.params.shopId || req.user?.storeId;
}

function isActiveCoupon(coupon, now = new Date()) {
  if (!coupon.activeFlag) return false;
  if (coupon.validFrom && now < new Date(coupon.validFrom)) return false;
  if (coupon.validUntil && now > new Date(coupon.validUntil)) return false;
  return true;
}

function computeExpiry(coupon, acquiredAt) {
  if (coupon.validDaysAfterAcquire && coupon.validDaysAfterAcquire > 0) {
    return new Date(
      acquiredAt.getTime() + coupon.validDaysAfterAcquire * 24 * 60 * 60 * 1000
    );
  }
  return coupon.validUntil ? new Date(coupon.validUntil) : null;
}

export async function listCoupons(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const docs = await Coupon.find({ shopId }).sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const doc = await Coupon.create({
      shopId,
      storeId: shopId,
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      discountType: req.body.discountType || "amount",
      discountValue: req.body.discountValue ?? 0,
      validFrom: req.body.validFrom,
      validUntil: req.body.validUntil,
      validDaysAfterAcquire: req.body.validDaysAfterAcquire ?? 0,
      maxRedemptions: req.body.maxRedemptions ?? 0,
      activeFlag: req.body.activeFlag ?? true,
    });
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Coupon code already exists" });
    }
    next(err);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    const couponId = req.params.couponId;
    const doc = await Coupon.findOneAndUpdate(
      { _id: couponId, shopId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Coupon not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    const couponId = req.params.couponId;
    const doc = await Coupon.findOneAndDelete({ _id: couponId, shopId }).lean();
    if (!doc) return res.status(404).json({ message: "Coupon not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function issueRedemption(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    const couponId = req.params.couponId;
    const coupon = await Coupon.findOne({ _id: couponId, shopId });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    const now = new Date();
    if (!isActiveCoupon(coupon, now)) {
      return res.status(409).json({ message: "Coupon is not active" });
    }
    if (
      coupon.maxRedemptions > 0 &&
      coupon.redeemedCount >= coupon.maxRedemptions
    ) {
      return res.status(409).json({ message: "Coupon limit reached" });
    }

    const expiresAt = computeExpiry(coupon, now);
    const body = req.body || {};
    const redemption = await CouponRedemption.create({
      couponId,
      shopId,
      storeId: shopId,
      customerId: body.customerId,
      status: "issued",
      acquiredAt: now,
      expiresAt,
      issuedBy: req.user?.userId,
    });
    res.status(201).json(redemption);
  } catch (err) {
    next(err);
  }
}

export async function useRedemption(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    const couponId = req.params.couponId;
    const redemptionId = req.params.redemptionId;
    const redemption = await CouponRedemption.findOne({
      _id: redemptionId,
      couponId,
      shopId,
    });
    if (!redemption) {
      return res.status(404).json({ message: "Redemption not found" });
    }
    if (redemption.status !== "issued") {
      return res.status(409).json({ message: "Redemption not in issued state" });
    }
    if (redemption.expiresAt && new Date() > redemption.expiresAt) {
      return res.status(409).json({ message: "Redemption expired" });
    }

    redemption.status = "used";
    redemption.usedAt = new Date();
    redemption.orderId = req.body?.orderId;
    await redemption.save();

    await Coupon.updateOne(
      { _id: couponId },
      { $inc: { redeemedCount: 1 } }
    );
    res.json(redemption);
  } catch (err) {
    next(err);
  }
}

export async function expireRedemption(req, res, next) {
  try {
    const shopId = ensureShopId(req);
    const couponId = req.params.couponId;
    const redemptionId = req.params.redemptionId;
    const redemption = await CouponRedemption.findOneAndUpdate(
      { _id: redemptionId, couponId, shopId },
      { $set: { status: "expired", expiresAt: new Date() } },
      { new: true }
    ).lean();
    if (!redemption) {
      return res.status(404).json({ message: "Redemption not found" });
    }
    res.json(redemption);
  } catch (err) {
    next(err);
  }
}
