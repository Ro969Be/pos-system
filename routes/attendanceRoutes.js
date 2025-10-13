// ==========================================================
// routes/attendanceRoutes.js
// ==========================================================
const express = require("express");
const auth = require("../middleware/authMiddleware");
const storeCtx = require("../middleware/storeContextMiddleware");
const ctrl = require("../controllers/attendanceController");

const router = express.Router();
router.use(auth, storeCtx);

router.get("/", ctrl.listByDate);
router.post("/clock-in", ctrl.clockIn);
router.post("/clock-out/:id", ctrl.clockOut);

module.exports = router;
