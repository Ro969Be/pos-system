// backend/src/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Store from "../models/Store.js";
import BusinessUser from "../models/BusinessUser.js";
import {
  normalizeEmail,
  normalizePhone,
  generateShopCode,
} from "../utils/identifiers.js";
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
  SubManager: ["kitchen.view", "hall.view", "pos.view"],
  FullTimeStaff: ["kitchen.view", "hall.view", "pos.view"],
  PartTimeStaff: ["kitchen.view", "hall.view"],
  Customer: [],
  PublicCustomer: [],
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

async function resolveShopCode(shopName, requested) {
  if (requested) {
    const trimmed = String(requested).trim();
    if (!trimmed) {
      throw Object.assign(new Error("shopCode is invalid"), {
        statusCode: 400,
      });
    }
    const exists = await Store.exists({ code: trimmed });
    if (exists) {
      throw Object.assign(new Error("Shop code already exists"), {
        statusCode: 409,
      });
    }
    return trimmed;
  }
  for (let i = 0; i < 5; i += 1) {
    const candidate = generateShopCode(shopName);
    const exists = await Store.exists({ code: candidate });
    if (!exists) return candidate;
  }
  throw Object.assign(new Error("Unable to allocate shop code"), {
    statusCode: 500,
  });
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
    const canonical =
      canonicalRole(assignment.role) || assignment.role || "FullTimeStaff";
    bindings.push({
      shopId: assignment.storeId,
      role: canonical,
    });
    if (canonical) roles.add(canonical);
  });

  const uniqueRoles = Array.from(roles);
  if (!uniqueRoles.length) {
    uniqueRoles.push("Customer");
  }
  return { biz, bindings: sanitizeBindings(bindings), roles: uniqueRoles };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body || {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    const existing = await User.findOne({ emailLower: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const phoneValue = typeof phone === "string" ? phone.trim() : undefined;
    const user = await User.create({
      userName: name.trim(),
      email,
      phone: phoneValue,
      passwordHash,
    });
    const { biz, bindings, roles } = await collectBindings(user._id);
    const payload = {
      userId: String(user._id),
      roles,
      bindings,
      storeId: null,
    };
    const token = signToken(payload);
    res.status(201).json({
      token,
      user: buildUserResponse({
        user,
        payload,
        bindings,
        businessUser: biz,
        activeStore: null,
      }),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    next(err);
  }
}

export async function registerOwner(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      shopName,
      shopCode,
      phone,
      address,
    } = req.body || {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password ||
      typeof shopName !== "string" ||
      !shopName.trim()
    ) {
      return res.status(400).json({
        message: "name, email, password and shopName are required",
      });
    }
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    const existing = await User.findOne({ emailLower: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const phoneValue = typeof phone === "string" ? phone.trim() : undefined;
    const user = await User.create({
      userName: name.trim(),
      email,
      phone: phoneValue,
      passwordHash,
    });
    const code = await resolveShopCode(shopName, shopCode);
    const store = await Store.create({
      shopName: shopName.trim(),
      code,
      phone: phoneValue,
      address: address || undefined,
      ownerUserId: user._id,
    });
    const businessUser = await BusinessUser.create({
      userId: user._id,
      businessName: shopName.trim(),
      role: "Owner",
      roleBindings: [{ shopId: store._id, role: "Owner" }],
    });
    await Store.updateOne(
      { _id: store._id },
      { $set: { businessId: businessUser._id, ownerUserId: user._id } }
    );
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { shopIds: store._id, storeIds: store._id } }
    );
    const { biz, bindings, roles } = await collectBindings(user._id);
    const payload = {
      userId: String(user._id),
      roles,
      bindings,
      storeId: determineActiveShopId(store._id, bindings),
    };
    const token = signToken(payload);
    const activeStore = payload.storeId
      ? await Store.findById(payload.storeId).lean()
      : null;
    res.status(201).json({
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
    // 🔍 一旦ここで詳細ログを出す
    console.error("registerOwner ERROR:", {
      message: err.message,
      code: err.code,
      name: err.name,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue,
    });

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    if (err.code === 11000) {
      // どのキーで重複したかを見て、メッセージを分ける
      const key = err.keyPattern ? Object.keys(err.keyPattern)[0] : null;

      if (key === "emailLower") {
        return res.status(409).json({ message: "Email already registered" });
      }

      if (key === "code") {
        return res.status(409).json({ message: "Shop code already exists" });
      }

      if (key === "userId") {
        return res
          .status(409)
          .json({ message: "BusinessUser already exists for this user" });
      }

      return res.status(409).json({
        message: "Duplicate key detected",
        keyPattern: err.keyPattern,
        keyValue: err.keyValue,
      });
    }

    next(err);
  }
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
