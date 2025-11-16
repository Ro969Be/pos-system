import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  listProducts
);
router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createProduct
);
router.patch(
  "/:productId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateProduct
);
router.delete(
  "/:productId",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  deleteProduct
);

export default router;
