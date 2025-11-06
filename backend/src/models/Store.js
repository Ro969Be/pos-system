import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // 店舗コード
    phone: String,
    address: String,
    settings: {
      serviceStartHour: { type: Number, default: 0 }, // 営業日の切替
      // 追加: カテゴリ別SLA（分）
      sla: {
        drink: { type: Number, default: 3 },
        food: { type: Number, default: 15 },
        dessert: { type: Number, default: 7 },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Store", StoreSchema);
