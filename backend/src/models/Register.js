import mongoose from "mongoose";
const RegisterSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    pass: { type: String, required: true },
    printerIP: { type: String },
    taxMode: {
      type: String,
      enum: ["standard", "inclusive", "exclusive", "reduced8", "non_tax"],
      default: "inclusive",
    },
    notes: String,
  },
  { timestamps: true }
);

RegisterSchema.pre("validate", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

export default mongoose.model("Register", RegisterSchema);
