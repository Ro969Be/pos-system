import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listFlr,
  createFlr,
  updateFlr,
  deleteFlr,
  listExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/finance.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/flr",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  listFlr
);
router.post(
  "/flr",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createFlr
);
router.patch(
  "/flr/:id",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateFlr
);
router.delete(
  "/flr/:id",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  deleteFlr
);

router.get(
  "/expense",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  listExpense
);
router.post(
  "/expense",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createExpense
);
router.patch(
  "/expense/:id",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateExpense
);
router.delete(
  "/expense/:id",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  deleteExpense
);

export default router;
