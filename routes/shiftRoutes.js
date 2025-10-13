// ==========================================================
// routes/shiftRoutes.js
// ==========================================================
const express = require("express");
const auth = require("../middleware/authMiddleware");
const storeCtx = require("../middleware/storeContextMiddleware");
const ctrl = require("../controllers/shiftController");

const router = express.Router();
router.use(auth, storeCtx);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
