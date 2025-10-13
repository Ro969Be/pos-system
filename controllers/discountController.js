// ==========================================================
// controllers/discountController.js
// ==========================================================
// 割引マスタ管理（クーポン・ポイント等）
// ==========================================================

const Discount = require("../models/Discount");

// 全取得
exports.getDiscounts = async (req, res) => {
  try {
    const data = await Discount.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 1件作成
exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount(req.body);
    const newDiscount = await discount.save();
    res.status(201).json(newDiscount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 更新
exports.updateDiscount = async (req, res) => {
  try {
    const updated = await Discount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 削除
exports.deleteDiscount = async (req, res) => {
  try {
    await Discount.findByIdAndDelete(req.params.id);
    res.json({ message: "削除しました" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
