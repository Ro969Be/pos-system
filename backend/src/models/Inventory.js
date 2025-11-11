import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sku: String,
    stockQty: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    hideWhenZero: { type: Boolean, default: false },
    lowStockNoteFlag: { type: Boolean, default: false },
    uom: String,
    lotNo: String,
    expireAt: Date,
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

InventorySchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  this.updatedAt = new Date();
  next();
});

InventorySchema.index(
  { shopId: 1, productId: 1 },
  { unique: true, name: "inventory_product_unique" }
);

export default mongoose.model("Inventory", InventorySchema);
