import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createOrder,
  payOrder,
  getOrder,
} from "../controllers/orders.controller.js";

const r = Router();
r.post("/", requireAuth, createOrder);
r.post("/:id/pay", requireAuth, payOrder);
r.get("/:id", requireAuth, getOrder);
export default r;
