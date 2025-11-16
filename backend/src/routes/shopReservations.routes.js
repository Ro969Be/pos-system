import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listReservations,
  createReservation,
  updateReservation,
} from "../controllers/reservation.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  listReservations
);

router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createReservation
);

router.patch(
  "/:reservationId",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  updateReservation
);

export default router;
