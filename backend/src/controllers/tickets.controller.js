// backend/src/controllers/tickets.controller.js
import Ticket from "../models/Ticket.js";
import MenuItem from "../models/MenuItem.js";
import Store from "../models/Store.js";
import { ticketAlertColor } from "../utils/time.js";

/** role=kitchen/hall での絞り込みとアラート付与 */
export async function listTickets(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { role = "kitchen" } = req.query;

    // 取得幅：ホールは READY/SERVED、キッチンは PENDING/COOKING/READY のみ
    const statusFilterByRole = {
      kitchen: ["PENDING", "COOKING", "READY"],
      hall: ["READY", "SERVED"],
    };
    const statuses = statusFilterByRole[role] || statusFilterByRole.kitchen;

    const [store, tickets] = await Promise.all([
      Store.findById(storeId).lean(),
      Ticket.find({ storeId, status: { $in: statuses } })
        .sort({ "timestamps.createdAt": 1 })
        .lean(),
    ]);

    const menuIds = tickets.map((t) => t.menuItemId).filter(Boolean);
    const menuMap = new Map();
    if (menuIds.length) {
      const menus = await MenuItem.find({ _id: { $in: menuIds } }).lean();
      for (const m of menus) menuMap.set(String(m._id), m);
    }

    const withAlert = tickets.map((t) => {
      const m = t.menuItemId ? menuMap.get(String(t.menuItemId)) : null;
      return {
        ...t,
        alert: ticketAlertColor(t, store, m),
        thresholdMin:
          m?.prepMinutes ?? store?.settings?.sla?.[m?.category || "food"] ?? 10,
      };
    });

    res.json(withAlert);
  } catch (e) {
    next(e);
  }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const userRole = req.user.role; // 'kitchen' | 'hall' | 'admin' 等
    const { id } = req.params;
    const { action, to } = req.body; // rollback の場合 to: 'READY'|'PENDING'

    const t = await Ticket.findOne({ _id: id, storeId });
    if (!t) return res.status(404).json({ message: "Ticket not found" });

    if (action === "start" && t.status === "PENDING") {
      t.status = "COOKING";
      t.timestamps.startedAt = new Date();
    } else if (
      action === "ready" &&
      (t.status === "PENDING" || t.status === "COOKING")
    ) {
      t.status = "READY";
      t.timestamps.readyAt = new Date();
    } else if (action === "serve") {
      // ✅ 配膳はホール（または管理者）のみ
      if (userRole !== "hall" && userRole !== "admin")
        return res.status(403).json({ message: "Only hall can serve" });
      if (t.status !== "READY")
        return res
          .status(400)
          .json({ message: "Invalid action for current status" });
      t.status = "SERVED";
      t.timestamps.servedAt = new Date();
    } else if (action === "rollback") {
      // ✅ 戻し（SERVED→READY/PENDING、READY→PENDING等）はホール（または管理者）のみ
      if (userRole !== "hall" && userRole !== "admin")
        return res.status(403).json({ message: "Only hall can rollback" });

      console.log(to);
      if (to === "READY") {
        // どの状態からでも未配膳へ（必要に応じて制約追加可）
        t.status = "READY";
        t.timestamps.servedAt = null;
        t.timestamps.readyAt = t.timestamps.readyAt || new Date();
      } else {
        // デフォルトは未調理へ
        t.status = "PENDING";
        t.timestamps.startedAt = null;
        t.timestamps.readyAt = null;
        t.timestamps.servedAt = null;
      }
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action for current status" });
    }

    await t.save();

    try {
      const io = req.app.locals.io;
      io?.to(`store:${storeId}`).emit("ticket:updated", {
        _id: t._id,
        status: t.status,
        timestamps: t.timestamps,
        orderId: t.orderId,
        storeId: t.storeId,
        tableId: t.tableId,
        menuItemId: t.menuItemId,
        name: t.name,
        category: t.category,
        qty: t.qty,
      });
    } catch {}

    res.json(t);
  } catch (e) {
    next(e);
  }
}
