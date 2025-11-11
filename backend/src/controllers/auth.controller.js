// backend/src/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Store from "../models/Store.js";
import BusinessUser from "../models/BusinessUser.js";
import { normalizeEmail, normalizePhone } from "../utils/identifiers.js";
import { canonicalRole } from "../utils/roles.js";

const PERMISSIONS_BY_ROLE = {
  Admin: [
    "kitchen.view",
    "hall.view",
    "pos.view",
    "pos.checkout",
    "sales.view",
    "staff.manage",
    "shops.manage",
  ],
  Owner: [
    "kitchen.view",
    "hall.view",
    "pos.view",
    "pos.checkout",
    "sales.view",
    "staff.manage",
    "shops.manage",
  ],
  AreaManager: [
    "kitchen.view",
    "hall.view",
    "pos.view",
    "sales.view",
    "staff.manage",
  ],
  StoreManager: ["kitchen.view", "hall.view", "pos.view", "pos.checkout"],
  AssistantManager: ["kitchen.view", "hall.view", "pos.view"],
  Employee: ["kitchen.view", "hall.view", "pos.view"],
  PartTime: ["kitchen.view", "hall.view"],
};

function buildPermissions(roles = []) {
  const set = new Set();
  roles.forEach((role) => {
    const canonical = canonicalRole(role) || role;
    (PERMISSIONS_BY_ROLE[canonical] || []).forEach((perm) => set.add(perm));
  });
  return Array.from(set);
}

function sanitizeBindings(bindings = []) {
  const seen = new Set();
  const result = [];
  bindings.forEach((binding) => {
    if (!binding.shopId || !binding.role) return;
    const key = `${String(binding.shopId)}:${binding.role}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push({
      shopId: String(binding.shopId),
      role: canonicalRole(binding.role) || binding.role,
    });
  });
  return result;
}

function determineActiveShopId(requestedShopId, bindings) {
  if (requestedShopId) {
    const exists = bindings.some(
      (binding) => String(binding.shopId) === String(requestedShopId)
    );
    if (!exists) {
      throw Object.assign(new Error("Shop access denied"), {
        statusCode: 403,
      });
    }
    return String(requestedShopId);
  }
  if (bindings.length === 1) return String(bindings[0].shopId);
  return null;
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  });
}

function buildUserResponse({
  user,
  payload,
  bindings,
  businessUser,
  activeStore,
}) {
  return {
    id: String(user._id),
    userName: user.userName,
    email: user.email,
    phone: user.phone,
    roles: payload.roles,
    bindings,
    storeId: payload.storeId,
    permissions: buildPermissions(payload.roles),
    businessUser: businessUser
      ? {
          id: String(businessUser._id),
          businessName: businessUser.businessName,
          role: businessUser.role,
        }
      : null,
    shop: activeStore
      ? {
          id: String(activeStore._id),
          name: activeStore.name,
          code: activeStore.code,
          type: activeStore.type,
        }
      : null,
  };
}

async function collectBindings(userId) {
  const [biz, staffAssignments] = await Promise.all([
    BusinessUser.findOne({ userId, activeFlag: { $ne: false } }).lean(),
    Staff.find({ userId, activeFlag: { $ne: false } })
      .select("_id storeId role employmentType activeFlag")
      .lean(),
  ]);

  const bindings = [];
  const roles = new Set();

  if (biz) {
    if (biz.role) roles.add(biz.role);
    (biz.roleBindings || []).forEach((binding) => {
      if (!binding?.shopId) return;
      bindings.push({ shopId: binding.shopId, role: binding.role });
      if (binding.role) roles.add(binding.role);
    });
  }

  (staffAssignments || []).forEach((assignment) => {
    if (!assignment?.storeId) return;
    const canonical = canonicalRole(assignment.role) || assignment.role || "Employee";
    bindings.push({
      shopId: assignment.storeId,
      role: canonical,
    });
    if (canonical) roles.add(canonical);
  });

  return { biz, bindings: sanitizeBindings(bindings), roles: Array.from(roles) };
}

export async function login(req, res, next) {
  try {
    const {
      identifier,
      email,
      phone,
      password,
      shopId,
      storeId,
    } = req.body || {};

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const emailCandidate = normalizeEmail(
      email || (identifier?.includes("@") ? identifier : null)
    );
    const phoneCandidate = normalizePhone(
      phone || (!identifier?.includes("@") ? identifier : null)
    );

    const lookup = [];
    if (emailCandidate) lookup.push({ emailLower: emailCandidate });
    if (phoneCandidate) lookup.push({ phoneNorm: phoneCandidate });
    if (!lookup.length) {
      return res
        .status(400)
        .json({ message: "Email or phone identifier is required" });
    }

    const user = await User.findOne({ $or: lookup });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const { biz, bindings, roles } = await collectBindings(user._id);
    const desiredShopId = shopId || storeId || null;
    const activeStoreId = determineActiveShopId(desiredShopId, bindings);

    const payload = {
      userId: String(user._id),
      roles,
      bindings,
      storeId: activeStoreId,
    };
    const token = signToken(payload);

    const activeStore = activeStoreId
      ? await Store.findById(activeStoreId).lean()
      : null;

    res.json({
      token,
      user: buildUserResponse({
        user,
        payload,
        bindings,
        businessUser: biz,
        activeStore,
      }),
    });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const [biz, store] = await Promise.all([
      BusinessUser.findOne({ userId: user._id, activeFlag: { $ne: false } })
        .select("businessName role")
        .lean(),
      req.user.storeId ? Store.findById(req.user.storeId).lean() : null,
    ]);

    res.json(
      buildUserResponse({
        user,
        payload: {
          userId: req.user.userId,
          roles: req.user.roles || [],
          bindings: req.user.bindings || [],
          storeId: req.user.storeId || null,
        },
        bindings: req.user.bindings || [],
        businessUser: biz,
        activeStore: store,
      })
    );
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { userName, phone, kanaSei, kanaMei } = req.body || {};
    if (typeof userName === "string") user.userName = userName.trim();
    if (typeof phone === "string") user.phone = phone.trim();
    if (typeof kanaSei === "string") user.kanaSei = kanaSei.trim();
    if (typeof kanaMei === "string") user.kanaMei = kanaMei.trim();
    await user.save();
    await me(req, res, next);
  } catch (err) {
    next(err);
  }
}
