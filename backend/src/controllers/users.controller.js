import mongoose from "mongoose";
import User from "../models/User.js";
import { normalizeEmail, normalizePhone } from "../utils/identifiers.js";

export async function searchUsersBasic(req, res, next) {
  try {
    const { email, phone, identifier, q } = req.query || {};
    const filters = [];
    const emailCandidate =
      email ||
      (typeof identifier === "string" && identifier.includes("@")
        ? identifier
        : undefined) ||
      (typeof q === "string" && q.includes("@") ? q : undefined);
    const phoneCandidate =
      phone ||
      (typeof identifier === "string" && !identifier.includes("@")
        ? identifier
        : undefined) ||
      (typeof q === "string" && !q.includes("@") ? q : undefined);

    const normalizedEmail = normalizeEmail(emailCandidate);
    const normalizedPhone = normalizePhone(phoneCandidate);

    if (normalizedEmail) filters.push({ emailLower: normalizedEmail });
    if (normalizedPhone) filters.push({ phoneNorm: normalizedPhone });
    if (q && mongoose.isValidObjectId(q)) {
      filters.push({ _id: q });
    }

    if (!filters.length) {
      return res.json([]);
    }

    const docs = await User.find({ $or: filters })
      .limit(10)
      .lean();

    const seen = new Set();
    const payload = [];
    docs.forEach((doc) => {
      const id = String(doc._id);
      if (seen.has(id)) return;
      seen.add(id);
      payload.push({
        id,
        name: doc.userName || doc.name || "",
        email: doc.email || null,
        phone: doc.phone || null,
      });
    });
    res.json(payload);
  } catch (err) {
    next(err);
  }
}
