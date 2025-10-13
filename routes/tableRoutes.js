// ==========================================================
// routes/tableRoutes.js
// ==========================================================
// テーブル（座席）ルート
// - 認証 + 店舗スコープ（storeContext）
// ==========================================================

const express = require("express");
const auth = require("../middleware/authMiddleware");
const storeContext = require("../middleware/storeContextMiddleware");
const {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  updateLayout,
  updateStatus,
} = require("../controllers/tableController");

const router = express.Router();
router.use(auth, storeContext);

router.get("/", getTables);
router.post("/", createTable);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

router.put("/:id/layout", updateLayout);
router.put("/:id/status", updateStatus);

module.exports = router;
