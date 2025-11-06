import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listTickets,
  updateTicketStatus,
} from "../controllers/tickets.controller.js";

const r = Router();
r.get("/", requireAuth, listTickets);
r.post("/:id/status", requireAuth, updateTicketStatus);
export default r;
