import mongoose from "mongoose";
const RegisterSchema = new mongoose.Schema(
  {
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
      enum: ["inclusive", "exclusive"],
      default: "inclusive",
    },
  },
  { timestamps: true }
);
export default mongoose.model("Register", RegisterSchema);
