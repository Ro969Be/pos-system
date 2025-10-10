// productController.js

const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

// ファイル削除ユーティリティ
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("⚠️ 画像削除エラー:", err.message);
    }
  });
};

// 商品一覧取得
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "サーバーエラー: 商品一覧を取得できません" });
  }
};

// 商品追加
const addProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: "名前と価格は必須です" });
    }

    const product = new Product({
      name,
      price,
      stock: stock ?? 0,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "サーバーエラー: 商品を追加できません" });
  }
};

// 商品更新（古い画像も削除）
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    // 新しい画像がアップロードされた場合、古い画像を削除
    if (req.file) {
      if (product.imageUrl) {
        const oldPath = path.join(__dirname, "..", product.imageUrl.replace(/^\//, ""));
        deleteFile(oldPath);
      }
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "サーバーエラー: 商品を更新できません" });
  }
};

// 商品削除（画像ファイルも削除）
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    // 画像ファイルがあれば削除
    if (product.imageUrl) {
      const filePath = path.join(__dirname, "..", product.imageUrl.replace(/^\//, ""));
      deleteFile(filePath);
    }

    res.json({ message: "商品を削除しました" });
  } catch (err) {
    res.status(500).json({ message: "サーバーエラー: 商品を削除できません" });
  }
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
