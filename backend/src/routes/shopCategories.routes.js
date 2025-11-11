import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], {
    shopIdParam: "shopId",
  }),
  listCategories
);
router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createCategory
);
router.patch(
  "/:categoryId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateCategory
);
router.delete(
  "/:categoryId",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  deleteCategory
);

export default router;
