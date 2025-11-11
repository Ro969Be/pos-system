import mongoose from "mongoose";

const ReservationSlotSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "18:00"
    capacityRemains: { type: Number, default: 0 },
    assignableTableIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Table" }],
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    openFlag: {
      type: String,
      enum: ["open", "hold", "close", "休"],
      default: "open",
    },
    seatTimeMinutes: { type: Number, default: 90 },
    overbookBuffer: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

ReservationSlotSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

ReservationSlotSchema.index(
  { shopId: 1, date: 1, time: 1 },
  { unique: true, name: "slot_unique_per_shop" }
);

export default mongoose.model("ReservationSlot", ReservationSlotSchema);
