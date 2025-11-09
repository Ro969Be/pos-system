import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const StaffSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    phone: String,
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["staff", "manager", "area_manager", "owner", "admin"],
      default: "staff",
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

StaffSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

StaffSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("Staff", StaffSchema);
