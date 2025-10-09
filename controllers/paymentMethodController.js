// controllers/paymentMethodController.js
const PaymentMethod = require("../models/PaymentMethod");

// 支払い方法一覧取得
const getPaymentMethods = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === "true" ? { isActive: true } : {};
    const methods = await PaymentMethod.find(filter);
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 支払い方法作成
const createPaymentMethod = async (req, res) => {
  try {
    const { name, displayName } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({ message: "name と displayName は必須です" });
    }

    // name のバリデーション（英小文字・数字・ハイフン・アンダースコアのみ許可）
    if (!/^[a-z0-9_-]+$/.test(name)) {
      return res.status(400).json({
        message: "name は英小文字・数字・ハイフン・アンダースコアのみ使用可能です",
      });
    }

    const exists = await PaymentMethod.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "同じ name の支払い方法が存在します" });
    }

    const method = new PaymentMethod({ name, displayName });
    await method.save();
    res.status(201).json(method);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 支払い方法更新（部分更新対応）
const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.displayName !== undefined) updates.displayName = req.body.displayName;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    const method = await PaymentMethod.findByIdAndUpdate(id, updates, { new: true });
    if (!method) return res.status(404).json({ message: "支払い方法が見つかりません" });

    res.json(method);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 支払い方法削除（論理削除: isActive=false）
const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const method = await PaymentMethod.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!method) {
      return res.status(404).json({ message: "支払い方法が見つかりません" });
    }

    res.json({ message: "非表示にしました", method });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
