// Order.js

const mongoose = require("mongoose");
const Product = require("./Product");

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["reserved", "completed", "cancelled"],
      default: "reserved",
    },
    payments: [
      {
        method: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentMethod", required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    reservationDate: { type: Date, required: true, index: true },
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true, index: true },
    tableNumber: { type: Number },
    staff: { type: String },
    isNoShow: { type: Boolean, default: false },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  },
  { timestamps: true }
);

// ---------------- Hooks ----------------
orderSchema.pre("save", async function (next) {
  try {
    // ✅ 合計金額を再計算
    let total = 0;
    for (const item of this.items) {
      const product = await Product.findById(item.product);
      if (!product) return next(new Error("存在しない商品が含まれています"));
      total += product.price * item.quantity;
    }
    this.totalPrice = Math.round(total);

    // ✅ 支払い合計チェック
    const paid = this.payments.reduce((sum, p) => sum + p.amount, 0);
    if (paid !== this.totalPrice) {
      return next(new Error("支払い合計が注文金額と一致しません"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Order", orderSchema);
