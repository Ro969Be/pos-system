// backend/src/models/Staff.js
import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, },

    // 店舗固有情報のみ保持
    displayName: { type: String },
    accountName: { type: String },
    role: {
      type: String,
      enum: ["admin", "owner", "area_manager", "store_manager", "assistant_manager", "employee", "part_time"],
      default: "staff",
    },
  },
  { timestamps: true }
);

// 同一 user x store の重複を禁止
StaffSchema.index({ storeId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Staff", StaffSchema);
