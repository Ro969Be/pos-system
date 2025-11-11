// backend/src/models/Shop.js
import mongoose from "mongoose";

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

const BusinessHourSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    open: String,
    close: String,
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    method: { type: String, required: true },
    available: { type: Boolean, default: true },
    note: String,
  },
  { _id: false }
);

const ReservationPolicySchema = new mongoose.Schema(
  {
    seatTimeMinutes: { type: Number, default: 90 },
    holdMinutes: { type: Number, default: 15 },
    overbookBuffer: { type: Number, default: 0 },
  },
  { _id: false }
);

const ShopSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessUser" },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    shopName: { type: String, required: true, trim: true },
    code: { type: String, trim: true, unique: true, sparse: true },
    shopKind: {
      type: String,
      enum: ["WebShop", "Restaurant", "Salon"],
      default: "Restaurant",
    },
    station: String,
    genre: String,
    businessHours: { type: [BusinessHourSchema], default: [] },
    businessDays: { type: [String], default: [] },
    regularHoliday: String,
    address: AddressSchema,
    access: String,
    payments: { type: [PaymentSchema], default: [] },
    phone: String,
    email: String,
    tables: { type: Number, default: 0 },
    facilities: { type: [String], default: [] },
    reservationPolicy: { type: ReservationPolicySchema, default: () => ({}) },
    calendarRule: {
      seatTimeMinutes: Number,
      overbookBuffer: Number,
    },
    googleCalendarSync: { type: Boolean, default: false },
    rating: Number,
    budgetLunch: Number,
    budgetDinner: Number,
    activeFlag: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "stores",
  }
);

ShopSchema.virtual("name")
  .get(function getName() {
    return this.shopName;
  })
  .set(function setName(value) {
    this.shopName = value;
  });

ShopSchema.index({ shopName: 1 }, { name: "shop_name_idx" });
ShopSchema.index(
  { shopKind: 1, "address.pref": 1 },
  { name: "shop_kind_pref_idx" }
);

export default mongoose.model("Shop", ShopSchema);
