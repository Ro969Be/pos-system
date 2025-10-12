// ==========================================================
// backend/middleware/authMiddleware.js
// ==========================================================
// JWTトークン検証用ミドルウェア（CommonJS構成）
// ----------------------------------------------------------
// 対応ユーザー種別：
//  - Customer（一般顧客）
//  - Staff（スタッフ）
//  - PublicCustomer（公開用顧客）
// ----------------------------------------------------------
// AuthorizationヘッダーからJWTを取得 → 検証 → DB参照
//  成功時: req.user にユーザー情報を格納
//  失敗時: 401エラーを返す
// ==========================================================

const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Staff = require("../models/Staff");
const PublicCustomer = require("../models/PublicCustomer");

const protect = async (req, res, next) => {
  let token;

  // "Authorization: Bearer <token>" 形式かチェック
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // JWT検証
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // typeごとにDB検索
      if (decoded.type === "customer") {
        req.user = await Customer.findById(decoded.id).select("-password");
      } else if (decoded.type === "staff") {
        req.user = await Staff.findById(decoded.id).select("-password");
      } else if (decoded.type === "public-customer") {
        req.user = await PublicCustomer.findById(decoded.id).select("-password");
      }

      // ユーザーが存在しない場合
      if (!req.user) {
        return res.status(401).json({ message: "無効なユーザーです" });
      }

      // req.user に追加情報を付与
      req.userType = decoded.type;
      next();
    } catch (error) {
      console.error("❌ JWT認証エラー:", error.message);
      res.status(401).json({ message: "トークンが無効または期限切れです" });
    }
  } else {
    res.status(401).json({ message: "認証トークンがありません" });
  }
};

module.exports = { protect };
