import { Router } from "express";
import auth from "./auth.routes.js";
import stores from "./stores.routes.js";
import menu from "./menu.routes.js";
import inventory from "./inventory.routes.js";
import reservation from "./reservation.routes.js";
import orders from "./orders.routes.js";
import tickets from "./tickets.routes.js";
import tables from "./tables.routes.js";
import business from "./business.routes.js";
import staff from "./staff.routes.js";
import storeconfig from "./storeconfig.routes.js";

const r = Router();
r.use("/auth", auth);
r.use("/stores", stores);
r.use("/menu", menu);
r.use("/inventory", inventory);
r.use("/reservations", reservation);
r.use("/orders", orders);
r.use("/tickets", tickets);
r.use("/tables", tables);
r.use("/business", business);
r.use("/staffs", staff);
r.use("/storeconfig", storeconfig);

export default r;
