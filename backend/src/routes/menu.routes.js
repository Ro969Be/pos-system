import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menu.controller.js";

const r = Router();

r.get("/", requireAuth, listMenu);
r.post("/", requireAuth, requireRole("manager", "owner"), createMenuItem);
r.patch("/:id", requireAuth, requireRole("manager", "owner"), updateMenuItem);
r.delete("/:id", requireAuth, requireRole("manager", "owner"), deleteMenuItem);

export default r;
