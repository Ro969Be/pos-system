import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createReservation,
  listReservations,
  checkAvailability,
  updateReservation,
  cancelReservation,
} from "../controllers/reservation.controller.js";

const r = Router();
r.get("/", requireAuth, listReservations);
r.get("/availability", requireAuth, checkAvailability);

r.post("/", requireAuth, createReservation);

r.patch("/:id", requireAuth, updateReservation);

r.delete(
  "/:id",
  requireAuth,
  requireRole("manager", "owner"),
  cancelReservation
);
export default r;
