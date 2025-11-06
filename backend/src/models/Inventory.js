import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
      index: true,
      unique: false, // storeId と複合ユニークで担保
    },
    qty: { type: Number, default: 0, min: 0 },
    lowThreshold: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true }
);

// 同一店舗・同一メニューで1行
InventorySchema.index({ storeId: 1, menuItemId: 1 }, { unique: true });

export default mongoose.model("Inventory", InventorySchema);
