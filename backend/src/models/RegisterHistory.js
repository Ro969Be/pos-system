import mongoose from "mongoose";

const RegisterHistorySchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    registerId: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "RegisterSession", required: true },
    openingAmount: Number,
    closingAmount: Number,
    expectedCash: Number,
    diffAmount: Number,
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvals: {
      required: Boolean,
      approved: Boolean,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: Date,
    },
    note: String,
  },
  { timestamps: true }
);

RegisterHistorySchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

RegisterHistorySchema.index({ registerId: 1, createdAt: -1 });

export default mongoose.model("RegisterHistory", RegisterHistorySchema);
