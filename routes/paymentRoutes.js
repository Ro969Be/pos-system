// ==========================================================
// routes/paymentRoutes.js
// ==========================================================
// 決済APIルート
// ==========================================================

const express = require("express");
const auth = require("../middleware/authMiddleware");
const storeContext = require("../middleware/storeContextMiddleware");
const {
  closeOrder,
  getPaymentMethods,
  generateReceipt,
} = require("../controllers/paymentController");

const router = express.Router();
router.use(auth, storeContext);

router.get("/methods", getPaymentMethods);
router.post("/close/:orderId", closeOrder);
router.post("/receipt/:orderId", generateReceipt);

module.exports = router;
