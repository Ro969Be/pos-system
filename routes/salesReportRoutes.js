// ==========================================================
// routes/salesReportRoutes.js
// ==========================================================
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const storeCtx = require("../middleware/storeContextMiddleware");
const ctrl = require("../controllers/salesReportController");

const router = express.Router();
router.use(protect, storeCtx);

// JSON
router.get("/summary", ctrl.getSalesSummary);
// CSV
router.get("/csv", ctrl.getSalesCsv);
// PDF
router.get("/pdf", ctrl.getSalesPdf);

module.exports = router;
