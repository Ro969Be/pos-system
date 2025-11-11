import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: String,
    discountType: {
      type: String,
      enum: ["amount", "percent"],
      default: "amount",
    },
    discountValue: { type: Number, required: true },
    validFrom: Date,
    validUntil: Date,
    validDaysAfterAcquire: { type: Number, default: 0 },
    maxRedemptions: { type: Number, default: 0 },
    redeemedCount: { type: Number, default: 0 },
    activeFlag: { type: Boolean, default: true },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

CouponSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

CouponSchema.index({ shopId: 1, code: 1 }, { unique: true });

export default mongoose.model("Coupon", CouponSchema);
