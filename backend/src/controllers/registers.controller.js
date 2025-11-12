import mongoose from "mongoose";
import Register from "../models/Register.js";
import RegisterSession from "../models/RegisterSession.js";
import RegisterHistory from "../models/RegisterHistory.js";
import TransactionLog from "../models/TransactionLog.js";
import PettyCash from "../models/PettyCash.js";

function ensureObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function assertRegister(shopId, registerId) {
  const reg = await Register.findOne({ _id: registerId, shopId });
  if (!reg) {
    const err = new Error("Register not found");
    err.statusCode = 404;
    throw err;
  }
  return reg;
}

export async function listRegisters(req, res, next) {
  try {
    const shopId = req.params.shopId;
    if (!ensureObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }
    const regs = await Register.find({ shopId }).sort({ createdAt: 1 }).lean();
    res.json(regs);
  } catch (err) {
    next(err);
  }
}

export async function getActiveSession(req, res, next) {
  try {
    const shopId = req.params.shopId;
    const registerId = req.params.registerId;
    if (!ensureObjectId(shopId) || !ensureObjectId(registerId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }
    const session = await RegisterSession.findOne({
      shopId,
      registerId,
      status: "open",
    })
      .sort({ openedAt: -1 })
      .lean();
    res.json(session || null);
  } catch (err) {
    next(err);
  }
}

export async function openRegisterSession(req, res, next) {
  try {
    const shopId = req.params.shopId;
    const registerId = req.params.registerId;
    if (!ensureObjectId(shopId) || !ensureObjectId(registerId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }
    await assertRegister(shopId, registerId);

    const existing = await RegisterSession.findOne({
      shopId,
      registerId,
      status: "open",
    });
    if (existing) {
      return res.status(409).json({ message: "Session already open" });
    }
    const openingAmount = Number(req.body.openingAmount);
    if (Number.isNaN(openingAmount)) {
      return res.status(400).json({ message: "openingAmount required" });
    }
    const session = await RegisterSession.create({
      shopId,
      storeId: shopId,
      registerId,
      openingAmount,
      expectedCash: openingAmount,
      openedBy: req.user?.userId,
    });
    res.status(201).json(session);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
}

export async function cashMovement(req, res, next) {
  try {
    const shopId = req.params.shopId;
    const registerId = req.params.registerId;
    const sessionId = req.params.sessionId;
    if (
      !ensureObjectId(shopId) ||
      !ensureObjectId(registerId) ||
      !ensureObjectId(sessionId)
    ) {
      return res.status(400).json({ message: "Invalid ids" });
    }
    const session = await RegisterSession.findOne({
      _id: sessionId,
      shopId,
      registerId,
      status: "open",
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "amount must be positive" });
    }
    const type = req.body.type || "cashIn";
    const reason = req.body.reason;
    const delta = type === "cashOut" || type === "pettyCash" ? -amount : amount;
    session.expectedCash += delta;
    await session.save();

    const log = await TransactionLog.create({
      shopId,
      storeId: shopId,
      registerId,
      sessionId,
      type,
      amount,
      reason,
      createdBy: req.user?.userId,
    });

    if (type === "pettyCash") {
      await PettyCash.create({
        shopId,
        storeId: shopId,
        registerId,
        sessionId,
        amount,
        reason,
        createdBy: req.user?.userId,
      });
    }

    res.status(201).json({
      logId: log._id,
      expectedCash: session.expectedCash,
    });
  } catch (err) {
    next(err);
  }
}

export async function closeRegisterSession(req, res, next) {
  try {
    const shopId = req.params.shopId;
    const registerId = req.params.registerId;
    const sessionId = req.params.sessionId;
    if (
      !ensureObjectId(shopId) ||
      !ensureObjectId(registerId) ||
      !ensureObjectId(sessionId)
    ) {
      return res.status(400).json({ message: "Invalid ids" });
    }
    const session = await RegisterSession.findOne({
      _id: sessionId,
      shopId,
      registerId,
      status: "open",
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    const closingAmount = Number(req.body.closingAmount);
    if (Number.isNaN(closingAmount)) {
      return res.status(400).json({ message: "closingAmount required" });
    }
    session.closingAmount = closingAmount;
    session.diffAmount = closingAmount - session.expectedCash;
    session.status = "closed";
    session.closedAt = new Date();
    session.closedBy = req.user?.userId;
    session.notes = req.body.notes;
    session.approvals = {
      required: Math.abs(session.diffAmount) > 0.009,
      approved: Math.abs(session.diffAmount) < 0.009,
      approvedBy: Math.abs(session.diffAmount) < 0.009 ? req.user?.userId : null,
      approvedAt: Math.abs(session.diffAmount) < 0.009 ? new Date() : null,
    };
    await session.save();

    await RegisterHistory.create({
      shopId,
      storeId: shopId,
      registerId,
      sessionId,
      openingAmount: session.openingAmount,
      closingAmount: session.closingAmount,
      expectedCash: session.expectedCash,
      diffAmount: session.diffAmount,
      openedBy: session.openedBy,
      closedBy: session.closedBy,
      approvals: session.approvals,
      note: session.notes,
    });

    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function approveSettlement(req, res, next) {
  try {
    const shopId = req.params.shopId;
    const sessionId = req.params.sessionId;
    if (!ensureObjectId(shopId) || !ensureObjectId(sessionId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }
    const session = await RegisterSession.findOne({ _id: sessionId, shopId });
    if (!session) return res.status(404).json({ message: "Session not found" });
    session.approvals = {
      required: session.approvals?.required || false,
      approved: true,
      approvedBy: req.user?.userId,
      approvedAt: new Date(),
    };
    await session.save();
    await RegisterHistory.updateOne(
      { sessionId },
      { $set: { approvals: session.approvals } }
    );
    res.json(session.approvals);
  } catch (err) {
    next(err);
  }
}

export async function listHistory(req, res, next) {
  try {
    const shopId = req.params.shopId;
    const registerId = req.params.registerId;
    if (!ensureObjectId(shopId) || !ensureObjectId(registerId)) {
      return res.status(400).json({ message: "Invalid ids" });
    }
    const status = req.query.status;
    if (status === "open") {
      const openSessions = await RegisterSession.find({
        shopId,
        registerId,
        status: "open",
      })
        .sort({ openedAt: -1 })
        .lean();
      return res.json(openSessions);
    }
    const history = await RegisterHistory.find({
      shopId,
      registerId,
    })
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 20)
      .lean();
    res.json(history);
  } catch (err) {
    next(err);
  }
}
