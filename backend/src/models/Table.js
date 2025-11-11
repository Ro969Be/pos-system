import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    tableName: { type: String, required: true, trim: true },
    name: { type: String, trim: true }, // legacy alias
    floor: { type: String, default: "1F" },
    area: String,
    capacity: { type: Number, required: true },
    type: {
      type: String,
      enum: ["table", "counter", "private", "terrace"],
      default: "table",
    },
    isPrivate: { type: Boolean, default: false },
    isSmoking: { type: Boolean, default: false },
    activeFlag: { type: Boolean, default: true },
    color: String,
    lock: {
      lockedBy: String,
      note: String,
      lockedAt: Date,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

TableSchema.pre("save", function syncFields(next) {
  if (!this.storeId) {
    this.storeId = this.shopId;
  }
  if (!this.shopId) {
    this.shopId = this.storeId;
  }
  if (!this.name) {
    this.name = this.tableName;
  }
  if (!this.tableName) {
    this.tableName = this.name;
  }
  next();
});

TableSchema.index(
  { shopId: 1, tableName: 1 },
  { unique: true, sparse: true, name: "shop_table_unique" }
);
TableSchema.index({ shopId: 1, activeFlag: 1 }, { name: "shop_active_idx" });

export default mongoose.model("Table", TableSchema);
