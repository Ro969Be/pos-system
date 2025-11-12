import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    category: String,
    amount: { type: Number, required: true },
    memo: String,
    incurredAt: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ExpenseSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

ExpenseSchema.index({ shopId: 1, incurredAt: -1 });

export default mongoose.model("Expense", ExpenseSchema);
