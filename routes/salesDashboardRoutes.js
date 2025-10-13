const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getTrend,
  getCategory,
  getPayment,
  getDetail,
} = require("../controllers/salesDashboardController");

const router = express.Router();
router.use(protect);

router.get("/trend", getTrend);
router.get("/category", getCategory);
router.get("/payment", getPayment);
router.get("/detail/:date/:storeId?", getDetail);

module.exports = router;
