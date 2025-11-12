import mongoose from "mongoose";

const FLRSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

FLRSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

FLRSchema.index({ shopId: 1, date: -1 });

export default mongoose.model("FLR", FLRSchema);
