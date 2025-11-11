import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true },
    url: { type: String, required: true },
    caption: String,
  },
  { timestamps: true }
);

PhotoSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

PhotoSchema.index({ reviewId: 1 });

export default mongoose.model("Photo", PhotoSchema);
