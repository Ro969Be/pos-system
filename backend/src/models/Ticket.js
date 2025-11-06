import mongoose from "mongoose";

/** キッチン/ホールで共有する伝票行単位 */
const TicketSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderItemIndex: { type: Number, required: true }, // Order.items の添字
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: String,
    category: String,
    qty: { type: Number, default: 1 },
    prepMinutes: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ["PENDING", "COOKING", "READY", "SERVED", "ARCHIVED"],
      default: "PENDING",
    },
    timestamps: {
      createdAt: { type: Date, default: Date.now },
      startedAt: Date, // COOKING
      readyAt: Date, // READY
      servedAt: Date, // SERVED
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", TicketSchema);
