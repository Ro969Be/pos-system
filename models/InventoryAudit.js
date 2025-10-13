// models/InventoryAudit.js
const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    expectedQty: Number,
    actualQty: Number,
    diff: Number,
    cost: Number,
    price: Number,
    memo: String,
    recordedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryAudit", auditSchema);
