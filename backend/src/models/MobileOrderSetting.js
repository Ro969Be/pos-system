import mongoose from "mongoose";
const MobileOrderSettingSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    enabled: { type: Boolean, default: false },
    pickupEnabled: { type: Boolean, default: false },
    deliveryEnabled: { type: Boolean, default: false },
    note: String,
  },
  { timestamps: true }
);
export default mongoose.model("MobileOrderSetting", MobileOrderSettingSchema);
