// backend/src/models/Staff.js
import mongoose from "mongoose";
import { ROLE_VALUES, canonicalRole, legacyRole } from "../utils/roles.js";

const EMPLOYMENT_TYPES = [
  "FullTime",
  "PartTime",
  "Contract",
  "Dispatch",
  "Intern",
  "Other",
];

const LEGACY_ROLE_VALUES = [
  "admin",
  "owner",
  "area_manager",
  "areamanager",
  "store_manager",
  "storemanager",
  "assistant_manager",
  "assistantmanager",
  "sub_manager",
  "submanager",
  "employee",
  "staff",
  "worker",
  "part_time",
  "part_time_staff",
  "full_time",
  "fulltime",
  "full_time_staff",
];

const StaffSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    displayName: { type: String, default: "" },
    accountName: { type: String },
    role: {
      type: String,
      enum: [...new Set([...ROLE_VALUES, ...LEGACY_ROLE_VALUES])],
      default: "FullTimeStaff",
      set: (value) => canonicalRole(value) || value,
    },
    skills: { type: [String], default: [] },
    color: { type: String },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      default: "FullTime",
    },
    activeFlag: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StaffSchema.virtual("shopId")
  .get(function getShopId() {
    return this.storeId;
  })
  .set(function setShopId(val) {
    this.storeId = val;
  });

StaffSchema.methods.primaryRole = function primaryRole() {
  return canonicalRole(this.role) || this.role || "FullTimeStaff";
};

StaffSchema.methods.primaryRoleLegacy = function primaryRoleLegacy() {
  return legacyRole(this.role) || this.role || "full_time_staff";
};

StaffSchema.index({ storeId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Staff", StaffSchema);
