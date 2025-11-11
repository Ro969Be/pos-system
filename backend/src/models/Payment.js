import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    method: {
      type: String,
      enum: ["Cash", "Card", "PayPay", "EMoney", "Other"],
      required: true,
    },
    amount: { type: Number, required: true },
    change: { type: Number, default: 0 },
    validationRule: {
      type: String,
      enum: ["insufficient", "exact", "excess-cash-OK"],
      default: "insufficient",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PaymentSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

PaymentSchema.index({ orderId: 1, createdAt: 1 });

export default mongoose.model("Payment", PaymentSchema);
