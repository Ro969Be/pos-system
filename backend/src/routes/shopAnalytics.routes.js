import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { salesAnalytics, productAnalytics } from "../controllers/analytics.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/sales",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], { shopIdParam: "shopId" }),
  salesAnalytics
);

router.get(
  "/products",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], { shopIdParam: "shopId" }),
  productAnalytics
);

export default router;
