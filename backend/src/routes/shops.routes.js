import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  listShops,
  createShop,
  updateShop,
  deleteShop,
} from "../controllers/shops.controller.js";
import {
  listTables,
  createTable,
  updateTable,
  deleteTable,
  lockTable,
} from "../controllers/tables.controller.js";
import {
  listShopStaff,
  addShopStaff,
} from "../controllers/staff.controller.js";

const router = Router();
router.use(requireAuth);

router.get("/", listShops);
router.post("/", requireRole(["Admin", "Owner"]), createShop);
router.patch(
  "/:id",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "id" }),
  updateShop
);
router.delete(
  "/:id",
  requireRole(["Admin", "Owner"], { shopIdParam: "id" }),
  deleteShop
);

router.get(
  "/:shopId/staff",
  requireRole(
    ["Admin", "Owner", "AreaManager", "StoreManager", "SubManager"],
    { shopIdParam: "shopId" }
  ),
  listShopStaff
);
router.post(
  "/:shopId/staff",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  addShopStaff
);

router.get(
  "/:shopId/tables",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  listTables
);
router.post(
  "/:shopId/tables",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  createTable
);
router.patch(
  "/:shopId/tables/:tableId",
  requireRole(["Admin", "Owner", "StoreManager"], { shopIdParam: "shopId" }),
  updateTable
);
router.delete(
  "/:shopId/tables/:tableId",
  requireRole(["Admin", "Owner"], { shopIdParam: "shopId" }),
  deleteTable
);
router.patch(
  "/:shopId/tables/:tableId/lock",
  requireRole(["Admin", "Owner", "AreaManager", "StoreManager", "SubManager", "FullTimeStaff"], {
    shopIdParam: "shopId",
  }),
  lockTable
);

export default router;
