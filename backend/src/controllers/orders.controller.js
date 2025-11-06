import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Ticket from "../models/Ticket.js";
import { validatePayments } from "../utils/payments.js";

export async function createOrder(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { tableId, reservationId, items } = req.body;

    // 明細計算
    const mIds = items.map((i) => i.menuItemId);
    const menuMap = new Map(
      (await MenuItem.find({ _id: { $in: mIds }, storeId })).map((m) => [
        String(m._id),
        m,
      ])
    );

    const calcItems = items.map((i) => {
      const m = menuMap.get(String(i.menuItemId));
      const price = i.price ?? m?.price ?? 0;
      const qty = i.qty ?? 1;
      return {
        ...i,
        name: i.name ?? m?.name,
        price,
        qty,
        lineTotal: price * qty,
      };
    });

    const subtotal = calcItems.reduce((a, i) => a + i.lineTotal, 0);
    const tax = 0; // 税計算は後続拡張(内税/外税の整合は別処理でも可)
    const total = subtotal + tax;

    const order = await Order.create({
      storeId,
      tableId,
      reservationId,
      items: calcItems,
      subtotal,
      tax,
      total,
      status: "open",
    });

    // キッチン伝票生成（PENDING）
    const tickets = [];
    for (let idx = 0; idx < calcItems.length; idx++) {
      const it = calcItems[idx];
      for (let q = 0; q < (it.qty || 1); q++) {
        tickets.push({
          storeId,
          orderId: order._id,
          orderItemIndex: idx,
          tableId,
          menuItemId: it.menuItemId,
          name: it.name,
          category: it.category,
          qty: 1,
          prepMinutes: it.prepMinutes ?? 10,
        });
      }
    }
    if (tickets.length) await Ticket.insertMany(tickets);

    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
}

export async function payOrder(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    const { payments } = req.body;

    const order = await Order.findOne({ _id: id, storeId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const v = validatePayments(order.total, payments);
    if (!v.ok) return res.status(400).json(v);

    order.payments = payments;
    order.status = "paid";
    await order.save();

    res.json({ ok: true, id: order._id, change: v.change || 0 });
  } catch (e) {
    next(e);
  }
}

export async function getOrder(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, storeId });
    res.json(order);
  } catch (e) {
    next(e);
  }
}
