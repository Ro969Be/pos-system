import mongoose from "mongoose";

const OneTimeTokenSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["business_set_password"], required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    token: { type: String, unique: true, index: true, required: true },
    expiresAt: { type: Date, index: true, required: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("OneTimeToken", OneTimeTokenSchema);
