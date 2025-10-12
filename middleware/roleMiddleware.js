// ==========================================================
// backend/middleware/roleMiddleware.js
// ==========================================================
// ロール制御ミドルウェア（CommonJS構成）
// ----------------------------------------------------------
// 使用例：
//   router.get("/", protect, authorizeRoles("admin", "manager"), getCustomers);
// ----------------------------------------------------------
// ロジック：
//   - protect() 実行後、req.user に role が設定されていることを前提
//   - 指定されたロール配列 allowedRoles に含まれるか判定
// ==========================================================

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 認証されていない or ロール情報なし
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: "認証情報が無効です" });
      }

      // ロール不一致の場合403
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "権限がありません" });
      }

      next();
    } catch (error) {
      console.error("❌ ロール検証エラー:", error.message);
      res.status(500).json({ message: "ロール検証中にエラーが発生しました" });
    }
  };
};

module.exports = { authorizeRoles };
