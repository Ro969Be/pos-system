// orderRoutes.js

const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  getSalesReport,
  cancelOrder,
  exportSalesReportCSV,
  exportSalesReportPDF,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");


const router = express.Router();

// 全注文取得   // 🔹日付指定は ?date=YYYY-MM-DD で検索可能
router.get("/", getOrders);

// JSONでレポート
router.get("/report/sales", getSalesReport);

// CSV出力（管理者のみ）
router.get("/report/csv", protect, adminOnly, exportSalesReportCSV);

// PDF出力（管理者のみ）
router.get("/report/pdf", protect, adminOnly, exportSalesReportPDF);

// 注文IDで取得（最後に回す！）
router.get("/:id", getOrderById);

// 注文（予約）作成
router.post("/", createOrder);

// 注文（予約）削除
router.delete("/:id", cancelOrder);

module.exports = router;
