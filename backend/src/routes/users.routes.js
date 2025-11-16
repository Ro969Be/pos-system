import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { searchUsersBasic } from "../controllers/users.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/search", requireRole(["Admin", "Owner"]), searchUsersBasic);

export default router;
