// backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { normalizeEmail, normalizePhone } from "../utils/identifiers.js";

const AddressSchema = new mongoose.Schema(
  {
    country: String,
    postal: String,
    pref: String,
    city: String,
    town: String,
    street: String,
    building: String,
  },
  { _id: false }
);

const OAuthProviderSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
    linkedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConsentFlagsSchema = new mongoose.Schema(
  {
    terms: { type: Boolean, default: false },
    privacy: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    thirdParty: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    emailLower: { type: String, lowercase: true, select: false, unique: true, select: false },
    phone: { type: String, trim: true, required: true },
    phoneNorm: { type: String, unique: true, select: false },
    iconUrl: String,
    kanaSei: String,
    kanaMei: String,
    sex: {
      type: String,
      enum: ["male", "female", "other", "unspecified"],
      default: "unspecified",
    },
    birth: Date,
    address: AddressSchema,
    oauthProviders: { type: [OAuthProviderSchema], default: [] },
    consentFlags: { type: ConsentFlagsSchema, default: () => ({}) },
    passwordHash: { type: String },
    // ShopIds in design ≒ storeIds already used across APIs
    shopIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
    storeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
  },
  { timestamps: true }
);

UserSchema.virtual("name")
  .get(function getName() {
    return this.userName;
  })
  .set(function setName(val) {
    this.userName = val;
  });

UserSchema.virtual("fullName").get(function fullName() {
  if (this.kanaSei || this.kanaMei)
    return `${this.kanaSei || ""}${this.kanaMei || ""}`.trim();
  return this.userName;
});

UserSchema.pre("save", function handleNormalization(next) {
  if (this.isModified("email") || this.isModified("emailLower")) {
    this.emailLower = normalizeEmail(this.email);
  }
  if (this.isModified("phone") || this.isModified("phoneNorm")) {
    this.phoneNorm = normalizePhone(this.phone);
  }
  if (this.isModified("shopIds") && !this.isModified("storeIds")) {
    this.storeIds = this.shopIds;
  } else if (this.isModified("storeIds") && !this.isModified("shopIds")) {
    this.shopIds = this.storeIds;
  }
  next();
});

UserSchema.methods.setPassword = async function setPassword(password) {
  if (!password) throw new Error("Password is required");
  this.passwordHash = await bcrypt.hash(password, 12);
};

UserSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.passwordHash || !password) return false;
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.index(
  { emailLower: 1 },
  { unique: true, sparse: true, name: "users_email_lower_unique" }
);
UserSchema.index(
  { phoneNorm: 1 },
  { unique: true, sparse: true, name: "users_phone_norm_unique" }
);
UserSchema.index({ shopIds: 1 }, { name: "users_shop_ids" });

export default mongoose.model("User", UserSchema);
