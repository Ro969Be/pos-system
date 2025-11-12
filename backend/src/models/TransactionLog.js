import mongoose from "mongoose";

const TransactionLogSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    registerId: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "RegisterSession", required: true },
    type: {
      type: String,
      enum: ["cashIn", "cashOut", "pettyCash", "sale"],
      required: true,
    },
    amount: { type: Number, required: true },
    reason: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

TransactionLogSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

TransactionLogSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model("TransactionLog", TransactionLogSchema);
