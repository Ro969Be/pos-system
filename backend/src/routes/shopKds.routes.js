import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listKdsTickets } from "../controllers/kds.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], {
    shopIdParam: "shopId",
  }),
  listKdsTickets
);

export default router;
