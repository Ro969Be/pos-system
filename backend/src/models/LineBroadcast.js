import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema(
  {
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
  },
  { _id: false }
);

const LineBroadcastSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    segments: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent"],
      default: "draft",
    },
    scheduledAt: Date,
    sentAt: Date,
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stats: { type: StatsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

LineBroadcastSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

LineBroadcastSchema.index({ shopId: 1, status: 1, createdAt: -1 });

export default mongoose.model("LineBroadcast", LineBroadcastSchema);
