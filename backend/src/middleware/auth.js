// backend/src/middleware/auth.js
import jwt from "jsonwebtoken";

/** DEV: 認証バイパス（環境変数でON） */
function devBypass(req, _res, next) {
  // ★ここにシードした storeId を入れる（後述の seed で表示されます）
  req.user = {
    staffId: "dev",
    role: "admin",
    storeId: process.env.DEV_STORE_ID,
  };
  next();
}

/** Bearer トークン検証 */
function realAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { staffId, role, storeId }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireAuth(req, res, next) {
  if (process.env.DEV_BYPASS_AUTH === "1") return devBypass(req, res, next);
  return realAuth(req, res, next);
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: "Forbidden" });

    if (req.user.role === "admin") return next();
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

export function requireBusinessAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // businessログインのトークンには businessId が入っている想定
    if (!payload?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // 役割チェック（必要に応じて緩めてもOK）
    if (!["owner", "admin"].includes(payload.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // 後段で使えるように
    req.user = {
      businessId: payload.businessId,
      role: payload.role,
      // 店舗はまだ選択していないので storeId は無し
    };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
