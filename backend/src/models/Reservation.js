import mongoose from "mongoose";

const PartySizeSchema = new mongoose.Schema(
  {
    total: { type: Number, required: true, min: 1 },
    adult: { type: Number, default: 1, min: 0 },
    child: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ReservationSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true, trim: true },
    kana: String,
    contactPhone: String,
    contactEmail: String,
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    partySize: { type: PartySizeSchema, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    channel: {
      type: String,
      enum: ["Web", "Phone", "Front", "Handy"],
      default: "Front",
    },
    status: {
      type: String,
      enum: ["hold", "confirmed", "arrived", "noShow", "cancelled"],
      default: "hold",
      index: true,
    },
    tags: { type: [String], default: [] },
    memo: String,
    courseId: mongoose.Schema.Types.ObjectId,
    googleCalendarEventId: String,
    holdExpiresAt: Date,
    holdReference: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ReservationSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

ReservationSchema.index({ shopId: 1, startTime: 1 });
ReservationSchema.index({ shopId: 1, status: 1 });

export default mongoose.model("Reservation", ReservationSchema);
