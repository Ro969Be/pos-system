const express = require("express");
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");
const {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} = require("../controllers/paymentMethodController");

const router = express.Router();

// 管理者のみアクセス可
router.use(protect, adminOnly);

router.get("/", getPaymentMethods);
router.post("/", createPaymentMethod);
router.put("/:id", updatePaymentMethod);
router.delete("/:id", deletePaymentMethod);

module.exports = router;
