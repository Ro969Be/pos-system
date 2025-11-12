import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  upsertInventory,
  updateInventory,
  listInventory,
  getInventoryByMenu,
  deleteInventory,
} from "../controllers/inventory.controller.js";

const r = Router();

// 取得
r.get("/", requireAuth, listInventory);
r.get("/by-menu/:menuItemId", requireAuth, getInventoryByMenu);

// 作成/更新（upsert）
r.post("/", requireAuth, requireRole("manager", "owner"), upsertInventory);

// 更新
r.patch("/:id", requireAuth, requireRole("manager", "owner"), updateInventory);

// 削除
r.delete("/:id", requireAuth, requireRole("manager", "owner"), deleteInventory);

export default r;
