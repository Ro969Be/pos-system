import mongoose from "mongoose";

const StationSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true }, // キッチン1、ドリンク、ホール など
    role: { type: String, enum: ["kitchen", "drink", "hall"], required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // 表示対象カテゴリ
    slaOverrideMinutes: { type: Map, of: Number }, // カテゴリごとのSLA上書き（分）
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export default mongoose.model("Station", StationSchema);
