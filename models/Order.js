// ==========================================================
// models/Order.js
// ==========================================================
// 注文モデル
// - 税率（複数対応: 8%, 10%, 0%）
// - 割引（order単位 / item単位）
// - 個別会計（splitPayments配列）
// ==========================================================

const mongoose = require("mongoose");
const Product = require("./Product");

const orderSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        taxRate: { type: Number, enum: [0, 8, 10], default: 10 }, // 🔹税率
        discounts: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Discount",
          },
        ], // アイテム個別割引
        splitGroup: { type: String, default: null }, // 個別会計グループ
      },
    ],

    totalPrice: { type: Number, required: true, default: 0 },
    discounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discount",
      },
    ], // 注文全体割引
    splitPayments: [
      {
        label: { type: String }, // 例: "Aさん分", "Bさん分"
        amount: { type: Number, required: true },
      },
    ],

    payments: [
      {
        method: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PaymentMethod",
          required: true,
        },
        amount: { type: Number, required: true, min: 0 },
      },
    ],

    status: {
      type: String,
      enum: ["reserved", "completed", "cancelled"],
      default: "reserved",
    },

    reservationDate: { type: Date, required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  try {
    let total = 0;

    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (!product) return next(new Error("存在しない商品があります"));

      const base = product.price * item.quantity;
      const taxRate = item.taxRate || 10;
      const taxed = Math.round(base * (1 + taxRate / 100));
      total += taxed;
    }

    this.totalPrice = Math.round(total);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Order", orderSchema);
