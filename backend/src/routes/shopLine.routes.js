import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listBroadcasts,
  createBroadcast,
  sendBroadcast,
} from "../controllers/line.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  listBroadcasts
);
router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createBroadcast
);
router.post(
  "/:broadcastId/send",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  sendBroadcast
);

export default router;
