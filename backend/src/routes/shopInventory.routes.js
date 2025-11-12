import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getInventory,
  upsertInventory,
  deleteInventory,
} from "../controllers/inventory.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/:productId",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], {
    shopIdParam: "shopId",
  }),
  getInventory
);

router.put(
  "/:productId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  upsertInventory
);

router.delete(
  "/:productId",
  requireRole(["Owner", "StoreManager"], { shopIdParam: "shopId" }),
  deleteInventory
);

export default router;
