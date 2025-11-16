import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { mutateKdsTicket } from "../controllers/kds.controller.js";

const router = Router();
router.use(requireAuth);

router.patch(
  "/:ticketId/:action",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"]),
  mutateKdsTicket
);

export default router;
