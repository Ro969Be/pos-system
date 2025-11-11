import mongoose from "mongoose";

const RevertHistorySchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    from: String,
    to: String,
    reason: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const KdsTicketSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    orderItemIndex: { type: Number, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: String,
    station: {
      type: String,
      enum: ["Kitchen", "Drink", "Hall"],
      default: "Kitchen",
      index: true,
    },
    qty: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["new", "inProgress", "ready", "servePending", "served", "reverted"],
      default: "new",
      index: true,
    },
    priority: { type: Number, default: 600 },
    stdPrepSeconds: { type: Number, default: 600 },
    alertAtYellow: Date,
    alertAtRed: Date,
    timestamps: {
      createdAt: { type: Date, default: Date.now },
      startedAt: Date,
      readyAt: Date,
      servedAt: Date,
    },
    revertHistory: { type: [RevertHistorySchema], default: [] },
  },
  { timestamps: true }
);

KdsTicketSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

KdsTicketSchema.index({ shopId: 1, station: 1, status: 1, priority: -1 });

export default mongoose.model("KdsTicket", KdsTicketSchema);
