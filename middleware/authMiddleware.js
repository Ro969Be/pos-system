// ==========================================================
// middleware/authMiddleware.js
// ==========================================================
// JWTトークン検証ミドルウェア
// ----------------------------------------------------------
// JWTに含まれる `type` に応じて対応モデルを検索。
// 成功時: req.user / req.userType に格納
// ==========================================================

const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const Customer = require("../models/Customer");
const PublicCustomer = require("../models/PublicCustomer");

const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "認証トークンがありません" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;

    switch (decoded.type) {
      case "staff":
      case "admin":
        user = await Staff.findById(decoded.id).select("-password");
        break;
      case "customer":
        user = await Customer.findById(decoded.id).select("-password");
        break;
      case "public-customer":
        user = await PublicCustomer.findById(decoded.id).select("-password");
        break;
      default:
        return res.status(401).json({ message: "不明なユーザータイプです" });
    }

    if (!user) {
      return res.status(401).json({ message: "無効なユーザーです" });
    }

    req.user = user;
    req.userType = decoded.type;
    next();
  } catch (error) {
    console.error("❌ JWT認証エラー:", error.message);
    res.status(401).json({ message: "トークンが無効または期限切れです" });
  }
};

module.exports = { protect };
