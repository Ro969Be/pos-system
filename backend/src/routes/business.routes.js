import { Router } from "express";
import {
  businessLogin,
  selectStore,
} from "../controllers/business.controller.js";
import { requireBusinessAuth } from "../middleware/auth.js";

const r = Router();
r.post("/login", businessLogin); // お店ログインID + PASS
r.post("/select-store", requireBusinessAuth, selectStore); // businessトークンで店舗選択
export default r;
