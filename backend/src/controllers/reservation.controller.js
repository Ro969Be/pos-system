import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import ReservationSlot from "../models/ReservationSlot.js";
import Table from "../models/Table.js";

const STATUS_FLOW = {
  hold: ["confirmed", "cancelled"],
  confirmed: ["arrived", "noShow", "cancelled"],
  arrived: [],
  noShow: [],
  cancelled: [],
};

function resolveShopId(req) {
  return req.params.shopId || req.body.shopId || req.query.shopId || req.user?.storeId;
}

function toDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function occupiedTables(shopId, start, end, excludeId = null) {
  const criteria = {
    shopId,
    status: { $in: ["hold", "confirmed", "arrived"] },
    startTime: { $lt: end },
    endTime: { $gt: start },
  };
  if (excludeId) criteria._id = { $ne: excludeId };
  const list = await Reservation.find(criteria).select("tableId").lean();
  const map = new Map();
  list.forEach((r) => {
    if (r.tableId) map.set(String(r.tableId), true);
  });
  return map;
}

async function autoAssignTable(shopId, people, start, end, excludeId = null) {
  const tables = await Table.find({ shopId })
    .sort({ capacity: 1 })
    .lean();
  if (!tables.length) return null;
  const occ = await occupiedTables(shopId, start, end, excludeId);
  return tables.find((t) => t.capacity >= people && !occ.get(String(t._id))) || null;
}

function normalizePartySize(body = {}) {
  const total = Number(body.total || body.people || 1);
  const adult = Number(body.adult ?? total);
  const child = Number(body.child ?? 0);
  return {
    total,
    adult: adult,
    child,
  };
}

function validateTransition(current, next) {
  if (current === next) return true;
  const allowed = STATUS_FLOW[current] || [];
  return allowed.includes(next);
}

export async function listReservations(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const from = req.query.from ? toDate(req.query.from) : new Date();
    const to =
      (req.query.to && toDate(req.query.to)) ||
      new Date(from.getTime() + 24 * 60 * 60 * 1000);
    const docs = await Reservation.find({
      shopId,
      startTime: { $lt: to },
      endTime: { $gt: from },
    })
      .sort({ startTime: 1 })
      .lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function checkAvailability(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const start = req.query.startTime || req.body?.startTime;
    const durationMinutes = Number(req.query.durationMinutes || req.body?.durationMinutes || 90);
    const partySize = Number(req.query.partySize || req.query.people || req.body?.partySize?.total || 1);
    const startDate = toDate(start || Date.now());
    if (!startDate) return res.status(400).json({ message: "Invalid startTime" });
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const table = await autoAssignTable(shopId, partySize, startDate, endDate);
    if (!table) return res.status(409).json({ available: false });
    return res.json({ available: true, tableId: table._id });
  } catch (err) {
    next(err);
  }
}

export async function createReservation(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }

    const {
      customerName,
      contactPhone,
      contactEmail,
      startTime,
      durationMinutes = 90,
      partySize = {},
      channel = "Front",
      status = "hold",
      holdMinutes = 15,
      memo,
      tags = [],
    } = req.body;

    if (!customerName || !startTime) {
      return res
        .status(400)
        .json({ message: "customerName and startTime are required" });
    }
    const start = toDate(startTime);
    if (!start) return res.status(400).json({ message: "Invalid startTime" });
    const dur = Number(durationMinutes);
    const end = new Date(start.getTime() + dur * 60000);

    const party = normalizePartySize(partySize);
    if (!party.total || party.total < 1) {
      return res.status(400).json({ message: "partySize.total must be >=1" });
    }

    const table = await autoAssignTable(shopId, party.total, start, end);
    if (!table) {
      return res.status(409).json({ message: "No available table for timeframe" });
    }

    const holdExpiresAt =
      status === "hold"
        ? new Date(Date.now() + Math.max(1, Math.min(Number(holdMinutes) || 15, 120)) * 60000)
        : null;

    const doc = await Reservation.create({
      shopId,
      storeId: shopId,
      customerName,
      contactPhone,
      contactEmail,
      startTime: start,
      endTime: end,
      partySize: party,
      tableId: table._id,
      channel,
      status,
      holdExpiresAt,
      memo,
      tags,
      createdBy: req.user?.userId,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function updateReservation(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const id = req.params.reservationId || req.params.id;
    const current = await Reservation.findOne({ _id: id, shopId });
    if (!current) return res.status(404).json({ message: "Reservation not found" });

    const nextParty = req.body.partySize
      ? normalizePartySize(req.body.partySize)
      : current.partySize;
    const startRaw = req.body.startTime || current.startTime;
    const start = toDate(startRaw);
    if (!start) return res.status(400).json({ message: "Invalid startTime" });
    const durationMinutes =
      Number(req.body.durationMinutes) ||
      (current.endTime.getTime() - current.startTime.getTime()) / 60000;
    const end = new Date(start.getTime() + durationMinutes * 60000);

    let tableId = current.tableId;
    const scheduleChanged =
      start.getTime() !== current.startTime.getTime() ||
      end.getTime() !== current.endTime.getTime() ||
      nextParty.total !== current.partySize.total;

    if (scheduleChanged) {
      const table = await autoAssignTable(
        shopId,
        nextParty.total,
        start,
        end,
        current._id
      );
      if (!table) {
        return res.status(409).json({ message: "No available table for timeframe" });
      }
      tableId = table._id;
    }

    let nextStatus = req.body.status || current.status;
    if (!validateTransition(current.status, nextStatus)) {
      return res.status(409).json({ message: "Invalid status transition" });
    }

    const holdExpiresAt =
      nextStatus === "hold"
        ? current.holdExpiresAt || new Date(Date.now() + 15 * 60000)
        : null;

    current.customerName = req.body.customerName ?? current.customerName;
    current.contactPhone = req.body.contactPhone ?? current.contactPhone;
    current.contactEmail = req.body.contactEmail ?? current.contactEmail;
    current.partySize = nextParty;
    current.startTime = start;
    current.endTime = end;
    current.tableId = tableId;
    current.memo = req.body.memo ?? current.memo;
    current.tags = req.body.tags ?? current.tags;
    current.channel = req.body.channel ?? current.channel;
    current.status = nextStatus;
    current.holdExpiresAt = holdExpiresAt;

    await current.save();
    res.json(current.toObject());
  } catch (err) {
    next(err);
  }
}

export async function listSlots(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const from = req.query.from ? toDate(req.query.from) : new Date();
    const to =
      (req.query.to && toDate(req.query.to)) ||
      new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);

    const docs = await ReservationSlot.find({
      shopId,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1, time: 1 })
      .lean();
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function upsertSlot(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: "date and time are required" });
    }
    const day = toDate(date);
    if (!day) return res.status(400).json({ message: "Invalid date" });
    const payload = {
      capacityRemains: req.body.capacityRemains,
      assignableTableIds: req.body.assignableTableIds,
      staffId: req.body.staffId,
      openFlag: req.body.openFlag,
      seatTimeMinutes: req.body.seatTimeMinutes,
      overbookBuffer: req.body.overbookBuffer,
      notes: req.body.notes,
    };

    const doc = await ReservationSlot.findOneAndUpdate(
      { shopId, date: day, time },
      {
        $set: {
          ...payload,
          shopId,
          storeId: shopId,
          date: day,
          time,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function patchSlot(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const { slotId } = req.params;
    const doc = await ReservationSlot.findOneAndUpdate(
      { _id: slotId, shopId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Slot not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function cancelReservation(req, res, next) {
  try {
    const shopId = resolveShopId(req);
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const id = req.params.reservationId || req.params.id;
    const doc = await Reservation.findOneAndUpdate(
      { _id: id, shopId },
      { $set: { status: "cancelled" } },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Reservation not found" });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
