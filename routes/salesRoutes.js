// ==========================================================
// routes/salesRoutes.js
// ==========================================================
// 売上分析ルート
// ==========================================================

const express = require("express");
const auth = require("../middleware/authMiddleware");
const storeContext = require("../middleware/storeContextMiddleware");
const {
  getTodaySales,
  getSalesByPeriod,
  getSalesByProduct,
} = require("../controllers/salesController");

const router = express.Router();
router.use(auth, storeContext);

router.get("/today", getTodaySales);
router.get("/period", getSalesByPeriod);
router.get("/product", getSalesByProduct);

module.exports = router;
