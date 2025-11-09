import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true }, // 例: 前菜/ドリンク/デザート
    slug: { type: String }, // 任意
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export default mongoose.model("Category", CategorySchema);
