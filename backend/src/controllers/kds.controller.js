import mongoose from "mongoose";
import KdsTicket from "../models/KdsTicket.js";

const DEFAULT_STATUS = {
  Kitchen: ["new", "inProgress", "ready"],
  Drink: ["new", "inProgress", "ready"],
  Hall: ["ready", "servePending"],
};

export async function listKdsTickets(req, res, next) {
  try {
    const { shopId } = req.params;
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const station = req.query.station || "Kitchen";
    const requestedStatus = req.query.status
      ? req.query.status.split(",")
      : DEFAULT_STATUS[station] || DEFAULT_STATUS.Kitchen;
    const criteria = {
      shopId,
      station,
      status: { $in: requestedStatus },
    };
    const query = KdsTicket.find(criteria).sort({ priority: -1, createdAt: 1 });
    const tickets = await query.lean();
    const now = Date.now();
    const enriched = tickets.map((ticket) => ({
      ...ticket,
      alertState:
        ticket.alertAtRed && now > new Date(ticket.alertAtRed).getTime()
          ? "red"
          : ticket.alertAtYellow && now > new Date(ticket.alertAtYellow).getTime()
          ? "yellow"
          : "normal",
    }));
    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

export async function mutateKdsTicket(req, res, next) {
  try {
    const { ticketId, action } = req.params;
    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({ message: "Invalid ticketId" });
    }
    const ticket = await KdsTicket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (
      req.user?.storeId &&
      String(req.user.storeId) !== String(ticket.storeId || ticket.shopId)
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const now = new Date();
    const previousStatus = ticket.status;

    if (action === "start") {
      if (ticket.status !== "new") {
        return res.status(409).json({ message: "Ticket not in new state" });
      }
      ticket.status = "inProgress";
      ticket.timestamps.startedAt = now;
    } else if (action === "ready") {
      if (!["new", "inProgress"].includes(ticket.status)) {
        return res.status(409).json({ message: "Ticket not in progress" });
      }
      ticket.status = "ready";
      ticket.timestamps.readyAt = now;
    } else if (action === "serve") {
      if (ticket.status === "ready") {
        ticket.status = "servePending";
      } else if (ticket.status === "servePending") {
        ticket.status = "served";
        ticket.timestamps.servedAt = now;
      } else {
        return res.status(409).json({ message: "Ticket not ready for serve" });
      }
    } else if (action === "revert") {
      const target = req.body?.to || "new";
      ticket.revertHistory.push({
        at: now,
        from: ticket.status,
        to: target,
        reason: req.body?.reason,
        userId: req.user?.userId,
      });
      ticket.status = target;
      if (target === "new") {
        ticket.timestamps.startedAt = null;
        ticket.timestamps.readyAt = null;
        ticket.timestamps.servedAt = null;
      }
    } else {
      return res.status(400).json({ message: "Unknown action" });
    }

    await ticket.save();

    try {
      req.app.locals.io?.to(`store:${ticket.storeId || ticket.shopId}`).emit(
        "kds:updated",
        {
          ticketId: ticket._id,
          status: ticket.status,
          previousStatus,
        }
      );
    } catch {
      /* ignore socket errors */
    }

    res.json(ticket);
  } catch (err) {
    next(err);
  }
}
