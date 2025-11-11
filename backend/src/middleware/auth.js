// backend/src/middleware/auth.js
import jwt from "jsonwebtoken";
import { hasRequiredRole, legacyRole } from "../utils/roles.js";

function attachUserContext(req, payload = {}) {
  const roles = Array.isArray(payload.roles) ? payload.roles : [];
  const bindings = Array.isArray(payload.bindings) ? payload.bindings : [];
  const activeShopId = payload.storeId;
  const bindingForStore = activeShopId
    ? bindings.find((b) => String(b.shopId) === String(activeShopId))
    : null;
  const primaryRole =
    bindingForStore?.role || roles[0] || payload.role || "Employee";

  req.user = {
    ...payload,
    roles,
    bindings,
    role: legacyRole(primaryRole) || primaryRole,
  };
}

function devBypass(req, _res, next) {
  const storeId = process.env.DEV_STORE_ID || null;
  attachUserContext(req, {
    userId: "dev-user",
    storeId,
    roles: ["Admin"],
    bindings: storeId ? [{ shopId: storeId, role: "Admin" }] : [],
  });
  next();
}

function realAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    attachUserContext(req, payload);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireAuth(req, res, next) {
  if (process.env.DEV_BYPASS_AUTH === "1") return devBypass(req, res, next);
  return realAuth(req, res, next);
}

function resolveShopId(req, options = {}) {
  if (options.shopId) return options.shopId;
  if (options.shopIdParam && req.params?.[options.shopIdParam]) {
    return req.params[options.shopIdParam];
  }
  if (options.shopIdQuery && req.query?.[options.shopIdQuery]) {
    return req.query[options.shopIdQuery];
  }
  if (options.shopIdBody && req.body?.[options.shopIdBody]) {
    return req.body[options.shopIdBody];
  }
  return req.user?.storeId;
}

export function requireRole(...args) {
  let options = {};
  if (
    args.length &&
    typeof args[args.length - 1] === "object" &&
    !Array.isArray(args[args.length - 1])
  ) {
    options = args.pop();
  }
  const normalized = args
    .flat()
    .filter(Boolean)
    .map((role) => role);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!normalized.length) return next();
    const shopId = resolveShopId(req, options);
    if (
      hasRequiredRole(req.user.roles, req.user.bindings, normalized, shopId)
    ) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  };
}

export function requireBusinessAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    attachUserContext(req, {
      ...payload,
      roles: payload.roles || [payload.role || "Owner"],
      bindings: payload.bindings || [],
    });
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
