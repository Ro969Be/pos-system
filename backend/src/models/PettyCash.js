import mongoose from "mongoose";

const PettyCashSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    registerId: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "RegisterSession", required: true },
    amount: { type: Number, required: true },
    reason: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PettyCashSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

PettyCashSchema.index({ sessionId: 1 });

export default mongoose.model("PettyCash", PettyCashSchema);
