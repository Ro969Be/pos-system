import mongoose from "mongoose";

const TaxBreakdownSchema = new mongoose.Schema(
  {
    taxRateId: String,
    taxClass: { type: String, enum: ["inclusive", "exclusive", "non"] },
    rate: Number,
    amount: Number,
  },
  { _id: false }
);

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: String,
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
    notes: String,
    variations: [{ name: String, value: String }],
    kdsStation: {
      type: String,
      enum: ["Kitchen", "Drink", "Hall", null],
      default: "Kitchen",
    },
    taxClass: {
      type: String,
      enum: ["inclusive", "exclusive", "non"],
      default: "inclusive",
    },
    prepSeconds: { type: Number, default: 600 },
  },
  { timestamps: false }
);

const InvoiceInfoSchema = new mongoose.Schema(
  {
    invoiceNumber: String,
    customerName: String,
    customerAddress: String,
    note: String,
  },
  { _id: false }
);

const PaymentSummarySchema = new mongoose.Schema(
  {
    paidTotal: { type: Number, default: 0 },
    changeDue: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    channel: {
      type: String,
      enum: ["Register", "Handy", "Web"],
      default: "Register",
    },
    status: {
      type: String,
      enum: ["open", "paid", "void"],
      default: "open",
      index: true,
    },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    taxBreakdown: { type: [TaxBreakdownSchema], default: [] },
    paymentSummary: { type: PaymentSummarySchema, default: () => ({}) },
    invoiceInfo: { type: InvoiceInfoSchema, default: () => ({}) },
    notes: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

OrderSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

OrderSchema.index({ shopId: 1, status: 1, createdAt: -1 });

export default mongoose.model("Order", OrderSchema);
