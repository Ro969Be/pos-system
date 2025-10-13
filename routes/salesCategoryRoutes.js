// ==========================================================
// routes/salesCategoryRoutes.js
// ==========================================================
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getSalesByCategory,
} = require("../controllers/salesCategoryController");

const router = express.Router();
router.use(protect);

router.get("/", getSalesByCategory);

module.exports = router;
