import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// 全商品取得
router.get('/', getProducts);

// 商品IDで取得
router.get('/:id', getProductById);

// 商品作成
router.post('/', createProduct);

// 商品更新
router.put('/:id', updateProduct);

// 商品削除
router.delete('/:id', deleteProduct);

export default router;