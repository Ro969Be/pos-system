// customerController.js
// ==========================================================
// 顧客コントローラ（CommonJS）
// - 既存CRUDを保持しつつ、検索/履歴/メモ/ポイント等のAPIを追加
// - storeIdスコープでのマルチテナント対応
// ==========================================================

const Customer = require("../models/Customer");
const Order = require("../models/Order");

// 全顧客取得（★既存：storeIdスコープを追加）
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ storeId: req.storeId }).sort({
      createdAt: -1,
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 顧客ID取得（★既存）
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 顧客作成（★既存：storeIdの付与を追加）
const createCustomer = async (req, res) => {
  try {
    const data = { ...req.body, storeId: req.storeId };
    const customer = new Customer(data);
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 顧客更新（★既存：storeIdスコープを追加）
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      req.body,
      { new: true }
    );
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 顧客削除（★既存：storeIdスコープを追加）
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔽 追加: 電話番号で検索（予約時の照合など）
const searchByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: "phone が必要です" });
    const customer = await Customer.findOne({ phone, storeId: req.storeId });
    res.json(customer || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔽 追加: 直近5回の注文履歴（Orderからも取得して補完）
const getRecentHistory = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    // DBの visitHistory を優先しつつ、不足時は Order を参照（保険）
    let history = (customer.visitHistory || []).slice(0, 5);

    // もし不足があれば、Orderから補完
    if (history.length < 5) {
      const orders = await Order.find({
        customer: customer._id,
        storeId: req.storeId,
      })
        .sort({ createdAt: -1 })
        .limit(5);
      const merged = [];
      const existingSet = new Set(history.map((h) => String(h.orderId)));
      for (const o of orders) {
        if (!existingSet.has(String(o._id))) {
          merged.push({
            date: o.createdAt,
            orderId: o._id,
            total: o.totalPrice,
          });
        }
      }
      history = [...history, ...merged].slice(0, 5);
    }

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔽 追加: 顧客メモ追記（既存メモの後ろに追記）
const appendMemo = async (req, res) => {
  try {
    const { memo } = req.body;
    const customer = await Customer.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    customer.memo = (customer.memo || "") + (memo ? `\n${memo}` : "");
    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🔽 追加: ポイント加算・減算
const updatePoints = async (req, res) => {
  try {
    const { delta } = req.body; // +10, -5 など
    if (typeof delta !== "number") {
      return res
        .status(400)
        .json({ message: "delta は数値で指定してください" });
    }
    const customer = await Customer.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    customer.points = Math.max(0, (customer.points || 0) + delta);
    await customer.save();
    res.json({ points: customer.points });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchByPhone,
  getRecentHistory,
  appendMemo,
  updatePoints,
};
