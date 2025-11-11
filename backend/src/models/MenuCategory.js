import mongoose from "mongoose";

const MenuCategorySchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    type: {
      type: String,
      enum: ["Course", "Drink", "Food", "Lunch", "SalonMenu"],
      default: "Food",
    },
    name: { type: String, required: true, trim: true },
    orderNo: { type: Number, default: 0 },
    activeFlag: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MenuCategorySchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

MenuCategorySchema.index(
  { shopId: 1, type: 1, orderNo: 1 },
  { name: "category_sort_idx" }
);

export default mongoose.model("MenuCategory", MenuCategorySchema);
