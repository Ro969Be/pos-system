import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listTables,
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/tables.controller.js";

const r = Router();
r.get("/", requireAuth, listTables);
r.post("/", requireAuth, requireRole("manager", "owner"), createTable);
r.patch("/:id", requireAuth, requireRole("manager", "owner"), updateTable);
r.delete("/:id", requireAuth, requireRole("manager", "owner"), deleteTable);
export default r;
