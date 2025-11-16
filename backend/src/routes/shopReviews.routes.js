import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listReviews,
  createReview,
  updateReview,
  deleteReview,
  addPhoto,
} from "../controllers/reviews.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  listReviews
);

router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createReview
);

router.patch(
  "/:reviewId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateReview
);

router.delete(
  "/:reviewId",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  deleteReview
);

router.post(
  "/:reviewId/photos",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  addPhoto
);

export default router;
