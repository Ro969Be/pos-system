import mongoose from "mongoose";
const MenuItemSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    category: { type: String, required: true }, // 例: drink, pasta, appetizer
    price: { type: Number, required: true },
    taxInclusion: {
      type: String,
      enum: ["inclusive", "exclusive"],
      default: "inclusive",
    }, // 内税/外税 :contentReference[oaicite:9]{index=9}
    prepMinutes: { type: Number, default: 10 }, // 提供目安時間(分) ← キッチンアラート計算に使用
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", MenuItemSchema);
