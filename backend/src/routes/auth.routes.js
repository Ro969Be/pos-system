import { Router } from "express";
import { login, registerStaff } from "../controllers/auth.controller.js";
const r = Router();

r.post("/login", login);
r.post("/staff/register", registerStaff);

export default r;
