import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";
const r = Router();
r.use(requireAuth, requireRole("manager", "owner", "admin"));
r.get("/", listStaff);
r.post("/", createStaff);
r.patch("/:id", updateStaff);
r.delete("/:id", deleteStaff);
export default r;
