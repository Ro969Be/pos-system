import mongoose from "mongoose";
const ReservationSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    phone: String,
    email: String,
    people: { type: Number, required: true, min: 1 },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    notes: String,
    tags: [String],
    status: {
      type: String,
      enum: ["booked", "seated", "completed", "cancelled"],
      default: "booked",
      index: true,
    },
  },
  { timestamps: true }
);
ReservationSchema.index({ storeId: 1, start: 1, end: 1 });
export default mongoose.model("Reservation", ReservationSchema);
