import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listSlots,
  upsertSlot,
  patchSlot,
} from "../controllers/reservation.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], {
    shopIdParam: "shopId",
  }),
  listSlots
);

router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  upsertSlot
);

router.patch(
  "/:slotId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  patchSlot
);

export default router;
