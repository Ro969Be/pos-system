import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getOrder,
  addOrderItems,
  updateOrderItem,
  deleteOrderItem,
  createPayment,
  createRefund,
} from "../controllers/orders.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/:orderId", getOrder);

router.post(
  "/:orderId/items",
  requireRole(["Admin", "Owner", "StoreManager"]),
  addOrderItems
);
router.patch(
  "/:orderId/items/:itemId",
  requireRole(["Admin", "Owner", "StoreManager"]),
  updateOrderItem
);
router.delete(
  "/:orderId/items/:itemId",
  requireRole(["Admin", "Owner", "StoreManager"]),
  deleteOrderItem
);

router.post(
  "/:orderId/payments",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"]),
  createPayment
);
router.post(
  "/:orderId/refunds",
  requireRole(["Admin", "Owner", "StoreManager"]),
  createRefund
);

export default router;
