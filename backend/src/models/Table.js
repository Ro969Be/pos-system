import mongoose from "mongoose";
const TableSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true }, // T1, Counter-1 等
    capacity: { type: Number, required: true }, // 最大人数
    type: {
      type: String,
      enum: ["table", "counter", "private", "terrace"],
      default: "table",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Table", TableSchema);
