import mongoose from "mongoose";

const CouponRedemptionSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    status: {
      type: String,
      enum: ["issued", "used", "expired"],
      default: "issued",
    },
    acquiredAt: { type: Date, default: Date.now },
    expiresAt: Date,
    usedAt: Date,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CouponRedemptionSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

CouponRedemptionSchema.index({ couponId: 1, status: 1 });

export default mongoose.model("CouponRedemption", CouponRedemptionSchema);
