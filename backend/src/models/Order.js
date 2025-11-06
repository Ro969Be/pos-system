import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: String,
    price: Number,
    qty: { type: Number, default: 1 },
    notes: String,
    variations: [{ name: String, value: String }],
    lineTotal: Number,
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["cash", "card", "paypay", "emoney", "other"],
      required: true,
    },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    items: [OrderItemSchema],
    subtotal: Number,
    tax: Number,
    total: Number,
    payments: [PaymentSchema], // バリデーションは utils/payments で
    status: {
      type: String,
      enum: ["open", "paid", "void", "refund"],
      default: "open",
    },
    isSplitBill: { type: Boolean, default: false },
    invoiceNumber: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
