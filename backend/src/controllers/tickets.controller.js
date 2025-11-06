import Ticket from "../models/Ticket.js";
import MenuItem from "../models/MenuItem.js";
import Store from "../models/Store.js";
import { ticketAlertColor } from "../utils/time.js";

/** role=kitchen/hall での絞り込みと、アラート色を付与して返す（SLA反映） */
export async function listTickets(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { role = "kitchen" } = req.query;

    const q = { storeId, status: { $in: ["PENDING", "COOKING", "READY"] } };
    const [store, tickets] = await Promise.all([
      Store.findById(storeId).lean(),
      Ticket.find(q).sort({ "timestamps.createdAt": 1 }).lean(),
    ]);

    // メニュー情報（category / prepMinutes）をまとめて取得
    const menuIds = tickets.map((t) => t.menuItemId).filter(Boolean);
    const menuMap = new Map();
    if (menuIds.length) {
      const menus = await MenuItem.find({ _id: { $in: menuIds } }).lean();
      for (const m of menus) menuMap.set(String(m._id), m);
    }

    // ホール側は READY も見るが、role別フィルタは必要に応じて調整可
    const filtered =
      role === "hall"
        ? tickets.filter((t) =>
            ["PENDING", "COOKING", "READY"].includes(t.status)
          )
        : tickets;

    const withAlert = filtered.map((t) => {
      const m = t.menuItemId ? menuMap.get(String(t.menuItemId)) : null;
      return {
        ...t,
        alert: ticketAlertColor(t, store, m),
        // デバッグ/可視化用（必要ならUIに表示）
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
    const { id } = req.params;
    const { action } = req.body; // 'start' | 'ready' | 'serve' | 'rollback'

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
    } else if (action === "serve" && t.status === "READY") {
      t.status = "SERVED";
      t.timestamps.servedAt = new Date();
    } else if (action === "rollback") {
      // 調理済/配膳済からの戻し
      t.status = "PENDING";
      t.timestamps.startedAt = null;
      t.timestamps.readyAt = null;
      t.timestamps.servedAt = null;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid action for current status" });
    }

    await t.save();

    try {
      const io = req.app.locals.io;
      io?.emit("ticket:updated", {
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
