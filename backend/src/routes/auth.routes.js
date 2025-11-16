import { Router } from "express";
import {
  login,
  me,
  register,
  registerOwner,
  updateMe,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.post("/register", register);
r.post("/register-owner", registerOwner);
r.post("/login", login);
r.get("/me", requireAuth, me);
r.patch("/me", requireAuth, updateMe);

export default r;
