import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
  listApplications,
  createApplication,
  updateApplication,
  listMessages,
  createMessage,
} from "../controllers/jobs.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], { shopIdParam: "shopId" }),
  listJobs
);
router.post(
  "/",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createJob
);
router.patch(
  "/:jobId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateJob
);
router.delete(
  "/:jobId",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  deleteJob
);

router.get(
  "/:jobId/applications",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], { shopIdParam: "shopId" }),
  listApplications
);
router.post(
  "/:jobId/applications",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createApplication
);
router.patch(
  "/:jobId/applications/:applicationId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateApplication
);

router.get(
  "/:jobId/applications/:applicationId/messages",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], { shopIdParam: "shopId" }),
  listMessages
);
router.post(
  "/:jobId/applications/:applicationId/messages",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], { shopIdParam: "shopId" }),
  createMessage
);

export default router;
