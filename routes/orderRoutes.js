import express from 'express';
import { createOrder, getOrders, getOrderById } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);         // 全注文取得   // 🔹日付指定は ?date=YYYY-MM-DD で検索可能
router.get('/:id', getOrderById);   // 注文IDで取得
router.post('/', createOrder);      // 注文（予約）作成

export default router;
