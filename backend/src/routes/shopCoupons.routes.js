import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  issueRedemption,
  useRedemption,
  expireRedemption,
} from "../controllers/coupons.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  listCoupons
);
router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createCoupon
);
router.patch(
  "/:couponId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateCoupon
);
router.delete(
  "/:couponId",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  deleteCoupon
);

router.post(
  "/:couponId/redemptions",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  issueRedemption
);
router.patch(
  "/:couponId/redemptions/:redemptionId/use",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  useRedemption
);
router.patch(
  "/:couponId/redemptions/:redemptionId/expire",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  expireRedemption
);

export default router;
