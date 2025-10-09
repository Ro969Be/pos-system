const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null }, // 予約と紐付け
    tableNumber: { type: Number, default: null }, // レストラン
    staff: { type: String, default: null },       // サロン

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        notes: { type: String }, // 例: "氷なし", "大盛り"
      },
    ],

    status: {
      type: String,
      enum: ["open", "closed", "cancelled"],
      default: "open",
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
