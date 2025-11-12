import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listRegisters,
  openRegisterSession,
  cashMovement,
  closeRegisterSession,
  listHistory,
  approveSettlement,
  getActiveSession,
} from "../controllers/registers.controller.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get(
  "/",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], {
    shopIdParam: "shopId",
  }),
  listRegisters
);

router.get(
  "/:registerId/session",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], {
    shopIdParam: "shopId",
  }),
  getActiveSession
);

router.post(
  "/:registerId/session",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  openRegisterSession
);

router.post(
  "/:registerId/session/:sessionId/cash",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], {
    shopIdParam: "shopId",
  }),
  cashMovement
);

router.patch(
  "/:registerId/session/:sessionId/close",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  closeRegisterSession
);

router.patch(
  "/:registerId/session/:sessionId/approve",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  approveSettlement
);

router.get(
  "/:registerId/history",
  requireRole(["Admin", "Owner", "StoreManager", "AssistantManager"], {
    shopIdParam: "shopId",
  }),
  listHistory
);

export default router;
