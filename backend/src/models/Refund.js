import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["Cash", "Card", "PayPay", "EMoney", "Other"],
      required: true,
    },
    reason: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    linkedPaymentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);

RefundSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

RefundSchema.index({ orderId: 1 });

export default mongoose.model("Refund", RefundSchema);
