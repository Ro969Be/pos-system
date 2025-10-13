// ==========================================================
// routes/cashSessionRoutes.js
// ==========================================================
const express = require("express");
const auth = require("../middleware/authMiddleware");
const storeCtx = require("../middleware/storeContextMiddleware");
const ctrl = require("../controllers/cashSessionController");

const router = express.Router();
router.use(auth, storeCtx);

router.get("/today", ctrl.todaySummary);
router.post("/open", ctrl.open);
router.post("/close/:id", ctrl.close);

module.exports = router;
