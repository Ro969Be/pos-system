import { Router } from "express";
import { login, registerStaff, registerOwner, registerAdmin, me, updateMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.post("/login", login);
r.post("/staff/register", registerStaff);
r.post("/owner/register", registerOwner);
r.post("/admin/register", registerAdmin);
r.get("/me", requireAuth, me);
r.patch("/me", requireAuth, updateMe); // ★追加
export default r;
