// backend/routes/orderItemRoutes.js
// このルートは create / update の後に Socket.io を emit します

const express = require("express");
const router = express.Router();
const OrderItemController = require("../controllers/orderItemController");

// GET /api/order-items
router.get("/", OrderItemController.getOrderItems);

// POST /api/order-items
router.post("/", async (req, res) => {
  try {
    // DB に保存（provideTime は controller 内でプリセット参照で補完される）
    const newItem = await (async () => {
      // 直接 controller の createOrderItem を呼ぶ代わりに内部ロジックを流用
      // ここでは controller.createOrderItem をコールして結果を受け取る
      // controller.createOrderItem は res を自分で返す設計のため、以下のように内部ロジックを利用する
      // 簡潔化のため、controller.createOrderItem を Promise でラップして呼び出す
      return new Promise((resolve, reject) => {
        // createOrderItem expects req, res; we create a fake res to capture json
        const fakeRes = {
          status(code) {
            this._code = code;
            return this;
          },
          json(data) {
            resolve(data);
          },
          send(err) {
            reject(err);
          },
        };
        OrderItemController.createOrderItem(req, fakeRes);
      });
    })();

    // Socket.io を取得して emit
    const io = req.app.get("io");
    if (io) {
      io.emit("newOrderItem", newItem);
    }

    // レスポンス
    res.status(201).json(newItem);
  } catch (err) {
    console.error("❌ POST /api/order-items error:", err);
    res.status(500).json({ message: "注文作成に失敗しました" });
  }
});

// PATCH /api/order-items/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    // 更新は controller に任せる
    // controller.updateOrderItemStatus は res を直接返すのでラップする
    const result = await new Promise((resolve, reject) => {
      const fakeRes = {
        json(data) {
          resolve(data);
        },
        status(code) {
          this._code = code;
          return this;
        },
        send(err) {
          reject(err);
        },
      };
      OrderItemController.updateOrderItemStatus(req, fakeRes);
    });

    // emit
    const io = req.app.get("io");
    if (io) {
      io.emit("orderItemUpdated", { id: result._id || result.id, status: result.status, _id: result._id });
    }

    res.json(result);
  } catch (err) {
    console.error("❌ PATCH /api/order-items/:id/status error:", err);
    res.status(500).json({ message: "ステータス更新に失敗しました" });
  }
});

module.exports = router;
