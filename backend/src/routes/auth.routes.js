import { Router } from "express";
import {
  login,
  registerStaff,
  registerOwner,
  registerAdmin,
  updateMe,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.post("/login", login);
r.post("/staff/register", registerStaff);
r.post("/owner/register", registerOwner);
r.post("/admin/register", registerAdmin);
r.patch("/me", requireAuth, updateMe);
r.get("/me", requireAuth, (req, res) => {
  const { businessId, storeId, role, staffId } = req.user || {};
  res.json({
    ok: true,
    businessId: businessId ?? null,
    storeId: storeId || null,
    staffId: staffId || null,
    role: role || null,
  });
});

export default r;
