import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createStore,
  getMyStore,
  updateSettings,
} from "../controllers/stores.controller.js";

const r = Router();
r.post("/", requireAuth, requireRole("owner"), createStore);
// r.post("/", createStore);
r.get("/me", requireAuth, getMyStore);
r.patch(
  "/settings",
  requireAuth,
  requireRole("manager", "owner"),
  updateSettings
);
export default r;
