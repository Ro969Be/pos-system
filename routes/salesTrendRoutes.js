const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getSalesTrend,
  getSalesTrendCSV,
  getSalesTrendPDF,
  getSalesDetail,
} = require("../controllers/salesTrendController");

const router = express.Router();
router.use(protect);

router.get("/", getSalesTrend);
router.get("/csv", getSalesTrendCSV);
router.get("/pdf", getSalesTrendPDF);
router.get("/detail/:date/:storeId?", getSalesDetail);

module.exports = router;
