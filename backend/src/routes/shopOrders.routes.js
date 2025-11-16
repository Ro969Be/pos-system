import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createOrder,
  listOrders,
  updateOrderStatus,
} from "../controllers/orders.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createOrder
);

router.get(
  "/",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  listOrders
);

router.patch(
  "/:orderId/status",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateOrderStatus
);

export default router;
