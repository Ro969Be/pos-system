import mongoose from "mongoose";

const AvailabilityWindowSchema = new mongoose.Schema(
  {
    startTime: String,
    endTime: String,
    daysOfWeek: { type: [String], default: [] },
  },
  { _id: false }
);

const VariationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priceDiff: { type: Number, default: 0 },
    requiredFlag: { type: Boolean, default: false },
    sku: String,
    barcode: String,
  },
  { _id: true, timestamps: false }
);

const ProductSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuCategory", required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    taxClass: {
      type: String,
      enum: ["inclusive", "exclusive", "non"],
      default: "inclusive",
    },
    kdsStation: {
      type: String,
      enum: ["Kitchen", "Drink", "Hall"],
      default: "Kitchen",
    },
    stdPrepSeconds: { type: Number, default: 600 },
    activeFlag: { type: Boolean, default: true },
    sku: String,
    allergens: { type: [String], default: [] },
    images: { type: [String], default: [] },
    availabilityWindow: AvailabilityWindowSchema,
    variations: { type: [VariationSchema], default: [] },
  },
  { timestamps: true }
);

ProductSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

ProductSchema.index(
  { shopId: 1, categoryId: 1, name: 1 },
  { name: "product_category_name_idx" }
);

export default mongoose.model("Product", ProductSchema);
