import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    customerName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["published", "hidden", "flagged"],
      default: "published",
    },
  },
  { timestamps: true }
);

ReviewSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

ReviewSchema.index({ shopId: 1, rating: -1 });

export default mongoose.model("Review", ReviewSchema);
