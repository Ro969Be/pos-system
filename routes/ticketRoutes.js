// ==========================================================
// routes/ticketRoutes.js
// ==========================================================
// チケット（伝票・レシート・領収書）ルート定義
// ----------------------------------------------------------
// ✅ 全一覧 / 単体取得 / PDF生成 / 情報更新
// ✅ storeContextMiddleware + JWT 認証必須
// ==========================================================

const express = require("express");
const {
  getTickets,
  getTicketById,
  generateReceipt,
  updateReceiptInfo,
} = require("../controllers/ticketController");

const auth = require("../middleware/authMiddleware");
const storeContext = require("../middleware/storeContextMiddleware");

const router = express.Router();

// ----------------------------------------------------------
// 全ルートで認証と店舗コンテキスト必須
// ----------------------------------------------------------
router.use(auth, storeContext);

// ----------------------------------------------------------
// APIルート定義
// ----------------------------------------------------------
router.get("/", getTickets); // 全件取得
router.get("/:id", getTicketById); // 単体取得
router.get("/:id/receipt", generateReceipt); // PDF生成
router.put("/:id/receipt-info", updateReceiptInfo); // 宛名等更新

module.exports = router;
