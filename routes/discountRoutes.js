// ==========================================================
// routes/discountRoutes.js
// ==========================================================
// 割引ルート
// ==========================================================

const express = require("express");
const {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} = require("../controllers/discountController");

const router = express.Router();

router.get("/", getDiscounts);
router.post("/", createDiscount);
router.put("/:id", updateDiscount);
router.delete("/:id", deleteDiscount);

module.exports = router;
