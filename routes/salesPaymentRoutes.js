// ==========================================================
// routes/salesPaymentRoutes.js
// ==========================================================
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getSalesByPayment } = require("../controllers/salesPaymentController");

const router = express.Router();
router.use(protect);

router.get("/", getSalesByPayment);

module.exports = router;
