// backend/src/models/BusinessUser.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_VALUES, canonicalRole } from "../utils/roles.js";

const RoleBindingSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      required: true,
    },
  },
  { _id: false }
);

const BusinessUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true },
    businessPassHash: { type: String },
    role: { type: String, enum: ROLE_VALUES, default: "Owner" },
    roleBindings: { type: [RoleBindingSchema], default: [] },
    shopIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
    activeFlag: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BusinessUserSchema.pre("save", function syncShopIds(next) {
  const bindingShopIds = (this.roleBindings || [])
    .map(({ shopId }) => shopId && String(shopId))
    .filter(Boolean);
  if (bindingShopIds.length) {
    const unique = Array.from(new Set(bindingShopIds));
    this.shopIds = unique.map((id) =>
      mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id
    );
  }
  next();
});

BusinessUserSchema.methods.setPassword = async function setPassword(password) {
  if (!password) throw new Error("Password is required");
  this.businessPassHash = await bcrypt.hash(password, 12);
};

BusinessUserSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.businessPassHash || !password) return false;
  return bcrypt.compare(password, this.businessPassHash);
};

BusinessUserSchema.methods.bindRole = function bindRole(shopId, role) {
  const canonical = canonicalRole(role);
  if (!canonical) return;
  const exists = (this.roleBindings || []).some(
    (binding) =>
      String(binding.shopId) === String(shopId) &&
      binding.role === canonical
  );
  if (!exists) {
    this.roleBindings.push({ shopId, role: canonical });
  }
};

BusinessUserSchema.index(
  { userId: 1 },
  { unique: true, name: "business_user_user_id_unique" }
);
BusinessUserSchema.index({ shopIds: 1 }, { name: "business_user_shop_ids" });

export default mongoose.model("BusinessUser", BusinessUserSchema);
