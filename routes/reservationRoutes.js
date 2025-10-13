// ==========================================================
// routes/reservationRoutes.js
// ==========================================================
// 予約ルート
// - 認証 + 店舗スコープ（storeContext）
// ==========================================================

const express = require("express");
const auth = require("../middleware/authMiddleware");
const storeContext = require("../middleware/storeContextMiddleware");
const {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  seatReservation,
  completeReservation,
} = require("../controllers/reservationController");

const router = express.Router();
router.use(auth, storeContext);

router.get("/", getReservations);
router.get("/:id", getReservation);
router.post("/", createReservation);
router.put("/:id", updateReservation);
router.post("/:id/cancel", cancelReservation);
router.post("/:id/seat", seatReservation);
router.post("/:id/complete", completeReservation);

module.exports = router;
