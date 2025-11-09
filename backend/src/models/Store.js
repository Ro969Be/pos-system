import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business" }, // 追加
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // 店舗コード
    phone: String,
    address: String,
    type: {
      type: String,
      enum: ["restaurant", "salon", "webshop"],
      default: "restaurant",
    }, // 追加
    settings: {
      serviceStartHour: { type: Number, default: 0 }, // 営業日の切替
      // カテゴリ別SLA（汎用化はStation側の上書きで対応）
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
