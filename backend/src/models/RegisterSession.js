import mongoose from "mongoose";

const ApprovalsSchema = new mongoose.Schema(
  {
    required: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
  },
  { _id: false }
);

const RegisterSessionSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    registerId: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
    openingAmount: { type: Number, required: true },
    expectedCash: { type: Number, required: true },
    closingAmount: { type: Number },
    diffAmount: { type: Number, default: 0 },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true,
    },
    openedAt: { type: Date, default: Date.now },
    closedAt: Date,
    notes: String,
    approvals: { type: ApprovalsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

RegisterSessionSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

RegisterSessionSchema.index({ registerId: 1, status: 1 });

export default mongoose.model("RegisterSession", RegisterSessionSchema);
