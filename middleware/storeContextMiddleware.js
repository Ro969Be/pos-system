// middleware/storeContextMiddleware.js
// ============================================================
// リクエストに紐づく storeId を強制的に挿入・検証するミドルウェア
// - JWT認証後に req.user.storeId をセット
// - すべてのAPIで storeId を利用可能にする
// ============================================================

module.exports = function storeContextMiddleware(req, res, next) {
  // スタッフ or 店舗ユーザーから storeId を取得
  if (req.user && req.user.storeId) {
    req.storeId = req.user.storeId;
  } else if (req.headers["x-store-id"]) {
    // APIリクエストヘッダーから手動指定も可
    req.storeId = req.headers["x-store-id"];
  } else {
    return res
      .status(400)
      .json({ message: "店舗ID (storeId) が指定されていません。" });
  }

  next();
};
