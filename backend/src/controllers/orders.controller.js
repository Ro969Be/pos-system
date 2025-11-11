import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import Refund from "../models/Refund.js";
import KdsTicket from "../models/KdsTicket.js";

const TAX_RATES = {
  inclusive: 0.1,
  exclusive: 0.1,
  non: 0,
};

const STATUS_FLOW = {
  open: ["paid", "void"],
  paid: ["void"],
  void: [],
};

function ensureShopScope(req, shopId) {
  if (!shopId) return;
  if (req.user?.storeId && String(req.user.storeId) !== String(shopId)) {
    throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
  }
}

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

async function fetchProducts(shopId, items) {
  const ids = items.map((i) => i.productId).filter(Boolean);
  if (!ids.length) return new Map();
  const docs = await Product.find({ _id: { $in: ids }, shopId }).lean();
  return new Map(docs.map((d) => [String(d._id), d]));
}

function calculateTotals(items) {
  let subtotal = 0;
  let taxTotal = 0;
  let exclusiveTax = 0;
  const breakdownMap = new Map();

  items.forEach((item) => {
    const line = item.unitPrice * item.qty;
    subtotal += line;
    const rate = TAX_RATES[item.taxClass] || 0;
    if (!rate) return;
    let taxAmount = 0;
    if (item.taxClass === "inclusive") {
      taxAmount = line - line / (1 + rate);
    } else if (item.taxClass === "exclusive") {
      taxAmount = line * rate;
      exclusiveTax += taxAmount;
    }
    taxTotal += taxAmount;
    const key = item.taxClass;
    const current = breakdownMap.get(key) || {
      taxRateId: key,
      taxClass: item.taxClass,
      rate,
      amount: 0,
    };
    current.amount += taxAmount;
    breakdownMap.set(key, current);
  });

  const total = subtotal + exclusiveTax;
  return {
    subtotal,
    taxTotal,
    total,
    taxBreakdown: Array.from(breakdownMap.values()),
  };
}

async function emitTickets(order, items, req) {
  const storeId = order.storeId || order.shopId;
  const docs = [];
  items.forEach((item, idx) => {
    if (!item.kdsStation) return;
    const prepSeconds = item.prepSeconds || 600;
    for (let i = 0; i < item.qty; i++) {
      const createdAt = new Date();
      docs.push({
        shopId: order.shopId,
        storeId,
        orderId: order._id,
        orderItemIndex: idx,
        tableId: order.tableId,
        productId: item.productId,
        productName: item.name,
        station: item.kdsStation,
        qty: 1,
        priority: prepSeconds,
        stdPrepSeconds: prepSeconds,
        alertAtYellow: new Date(createdAt.getTime() + prepSeconds * 1000),
        alertAtRed: new Date(createdAt.getTime() + prepSeconds * 1500),
      });
    }
  });
  if (docs.length) {
    await KdsTicket.insertMany(docs);
    try {
      req.app.locals.io?.to(`store:${storeId}`).emit("kds:created", {
        orderId: order._id,
        ticketCount: docs.length,
      });
    } catch {
      /* socket errors ignored */
    }
  }
}

function buildOrderItems(rawItems, productMap) {
  return rawItems.map((item) => {
    const product = productMap.get(String(item.productId));
    const unitPrice =
      item.unitPrice ?? product?.price ?? (() => { throw new Error("Missing price"); })();
    const qty = item.qty ?? 1;
    return {
      productId: item.productId,
      name: product?.name ?? item.name ?? "Item",
      sku: product?.sku,
      unitPrice,
      qty,
      lineTotal: unitPrice * qty,
      notes: item.notes,
      variations: item.variations || [],
      kdsStation: product?.kdsStation,
      taxClass: product?.taxClass || "inclusive",
      prepSeconds: product?.stdPrepSeconds || 600,
    };
  });
}

async function recalcOrderTotals(order) {
  const totals = calculateTotals(order.items);
  order.subtotal = totals.subtotal;
  order.taxTotal = totals.taxTotal;
  order.total = totals.total;
  order.taxBreakdown = totals.taxBreakdown;
}

async function loadOrder(orderId) {
  if (!mongoose.isValidObjectId(orderId)) return null;
  return Order.findById(orderId);
}

export async function createOrder(req, res, next) {
  try {
    const shopId = req.params.shopId;
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    ensureShopScope(req, shopId);
    const items = req.body.items || [];
    if (!items.length) {
      return res.status(400).json({ message: "Order items are required" });
    }
    const productMap = await fetchProducts(shopId, items);
    const orderItems = buildOrderItems(items, productMap);
    const totals = calculateTotals(orderItems);
    const order = await Order.create({
      shopId,
      storeId: shopId,
      tableId: req.body.tableId,
      reservationId: req.body.reservationId,
      customerId: req.body.customerId,
      channel: req.body.channel || "Register",
      items: orderItems,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      taxBreakdown: totals.taxBreakdown,
      notes: req.body.notes,
      status: "open",
    });
    await emitTickets(order, orderItems, req);
    res.status(201).json(order);
  } catch (err) {
    if (err.message === "Missing price") {
      return res.status(400).json({ message: "Unable to determine product price" });
    }
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const shopId = req.params.shopId;
    if (!mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    ensureShopScope(req, shopId);
    const status = req.query.status || "open";
    const docs = await Order.find({ shopId, status }).sort({ createdAt: -1 }).lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await loadOrder(req.params.orderId || req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    ensureShopScope(req, order.shopId);
    res.json(order);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const order = await loadOrder(req.params.orderId || req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    ensureShopScope(req, order.shopId);
    const nextStatus = req.body.status;
    const allowed = STATUS_FLOW[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      return res.status(409).json({ message: "Invalid status transition" });
    }
    order.status = nextStatus;
    await order.save();
    res.json(order);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
}

export async function addOrderItems(req, res, next) {
  try {
    const order = await loadOrder(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    ensureShopScope(req, order.shopId);
    if (order.status !== "open") {
      return res.status(409).json({ message: "Cannot modify closed order" });
    }
    const items = req.body.items || [];
    if (!items.length) {
      return res.status(400).json({ message: "Items are required" });
    }
    const productMap = await fetchProducts(order.shopId, items);
    const newItems = buildOrderItems(items, productMap);
    order.items.push(...newItems);
    await recalcOrderTotals(order);
    await order.save();
    await emitTickets(order, newItems, req);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderItem(req, res, next) {
  try {
    const order = await loadOrder(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    ensureShopScope(req, order.shopId);
    if (order.status !== "open") {
      return res.status(409).json({ message: "Cannot modify closed order" });
    }
    const item = order.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (req.body.qty != null) item.qty = req.body.qty;
    if (req.body.unitPrice != null) item.unitPrice = req.body.unitPrice;
    if (req.body.notes != null) item.notes = req.body.notes;
    item.lineTotal = item.unitPrice * item.qty;
    await recalcOrderTotals(order);
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function deleteOrderItem(req, res, next) {
  try {
    const order = await loadOrder(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    ensureShopScope(req, order.shopId);
    if (order.status !== "open") {
      return res.status(409).json({ message: "Cannot modify closed order" });
    }
    const item = order.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.deleteOne();
    await recalcOrderTotals(order);
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function computeNetPaid(orderId) {
  const [payments, refunds] = await Promise.all([
    Payment.aggregate([
      { $match: { orderId: toObjectId(orderId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Refund.aggregate([
      { $match: { orderId: toObjectId(orderId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);
  const paid = payments[0]?.total || 0;
  const refunded = refunds[0]?.total || 0;
  return paid - refunded;
}

function normalizeMethod(method = "Cash") {
  const upper = String(method).toLowerCase();
  if (upper === "cash") return "Cash";
  if (upper === "card") return "Card";
  if (upper === "paypay") return "PayPay";
  if (upper === "emoney") return "EMoney";
  return "Other";
}

export async function createPayment(req, res, next) {
  try {
    const order = await loadOrder(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    ensureShopScope(req, order.shopId);
    if (order.status === "void") {
      return res.status(409).json({ message: "Cannot pay void order" });
    }
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }
    const method = normalizeMethod(req.body.method);
    const netPaid = await computeNetPaid(order._id);
    const newTotal = netPaid + amount;
    const due = order.total;
    let validationRule = "insufficient";
    let change = 0;
    if (newTotal < due) {
      validationRule = "insufficient";
    } else if (Math.abs(newTotal - due) < 0.0001) {
      validationRule = "exact";
    } else {
      if (method === "Cash") {
        validationRule = "excess-cash-OK";
        change = newTotal - due;
      } else {
        return res.status(400).json({
          message: "Excess payment not allowed for this method",
          validationRule: "excess-NG",
        });
      }
    }

    const payment = await Payment.create({
      shopId: order.shopId,
      storeId: order.storeId,
      orderId: order._id,
      method,
      amount,
      change,
      validationRule,
      createdBy: req.user?.userId,
    });

    const netAfter = await computeNetPaid(order._id);
    order.paymentSummary = {
      paidTotal: Math.min(netAfter, due),
      changeDue: validationRule === "excess-cash-OK" ? change : 0,
    };
    if (netAfter >= due) {
      order.status = "paid";
    }
    await order.save();

    res.status(201).json({
      paymentId: payment._id,
      validationRule,
      change,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
}

export async function createRefund(req, res, next) {
  try {
    const order = await loadOrder(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    ensureShopScope(req, order.shopId);
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }
    const netPaid = await computeNetPaid(order._id);
    if (amount > netPaid) {
      return res.status(409).json({ message: "Refund exceeds paid total" });
    }
    const refund = await Refund.create({
      shopId: order.shopId,
      storeId: order.storeId,
      orderId: order._id,
      amount,
      method: normalizeMethod(req.body.method),
      reason: req.body.reason,
      approvedBy: req.user?.userId,
      linkedPaymentIds: req.body.linkedPaymentIds || [],
    });
    const netAfter = await computeNetPaid(order._id);
    order.paymentSummary = {
      paidTotal: Math.max(netAfter, 0),
      changeDue: order.paymentSummary?.changeDue || 0,
    };
    if (netAfter < order.total && order.status === "paid") {
      order.status = "open";
    }
    await order.save();
    res.status(201).json(refund);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
}
