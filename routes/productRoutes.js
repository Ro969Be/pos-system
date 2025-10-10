// productRoutes.js

const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// 📂 multer の設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 保存先
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // オリジナル拡張子を維持
  },
});

const upload = multer({ storage });

// 商品一覧
router.get("/", getProducts);

// 商品追加（画像アップロード対応）
router.post("/", upload.single("image"), addProduct);

// 商品更新（画像アップロード対応 & 古い画像削除）
router.put("/:id", upload.single("image"), updateProduct);

// 商品削除（画像も削除）
router.delete("/:id", deleteProduct);

module.exports = router;
