// ==========================================================
// models/Report.js
// ==========================================================
// 日次・月次の売上レポートモデル
// ----------------------------------------------------------
// 各店舗の売上集計を保存（ダッシュボードで使用）
// ==========================================================

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalCustomers: {
      type: Number,
      default: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
    },
    cashSales: {
      type: Number,
      default: 0,
    },
    cardSales: {
      type: Number,
      default: 0,
    },
    paypaySales: {
      type: Number,
      default: 0,
    },
    otherSales: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
