import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getStoreDetail,
  updateStoreDetail,
  listCategories,
  createCategory,
  deleteCategory,
  listStations,
  createStation,
  updateStation,
  deleteStation,
  listRegisters,
  createRegister,
  updateRegister,
  deleteRegister,
  getMobileOrder,
  updateMobileOrder,
  listTables,
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/storeconfig.controller.js";

const r = Router();
r.use(requireAuth, requireRole("manager", "owner", "admin"));
// 店舗詳細
r.get("/store", getStoreDetail);
r.patch("/store", updateStoreDetail);
// カテゴリ
r.get("/categories", listCategories);
r.post("/categories", createCategory);
r.delete("/categories/:id", deleteCategory);
// ステーション
r.get("/stations", listStations);
r.post("/stations", createStation);
r.patch("/stations/:id", updateStation);
r.delete("/stations/:id", deleteStation);
// レジ
r.get("/registers", listRegisters);
r.post("/registers", createRegister);
r.patch("/registers/:id", updateRegister);
r.delete("/registers/:id", deleteRegister);
// モバイルオーダー
r.get("/mobile-order", getMobileOrder);
r.patch("/mobile-order", updateMobileOrder);
// テーブル
r.get("/tables", listTables);
r.post("/tables", createTable);
r.patch("/tables/:id", updateTable);
r.delete("/tables/:id", deleteTable);

export default r;
