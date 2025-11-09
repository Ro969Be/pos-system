import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BusinessSchema = new mongoose.Schema(
  {
    loginId: { type: String, required: true, unique: true }, // お店ログインID
    name: { type: String, required: true },
    email: { type: String },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

BusinessSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

BusinessSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("Business", BusinessSchema);
