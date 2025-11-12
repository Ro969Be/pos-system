import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createStore, getMyStore, updateSettings } from "../controllers/stores.controller.js";

const r = Router();
// 初回セットアップを通すため一旦公開（あとでadmin限定に戻せる）
r.post("/", createStore);

r.get("/me", requireAuth, getMyStore);
r.patch("/settings", requireAuth, requireRole("manager", "owner", "admin"), updateSettings);
export default r;
