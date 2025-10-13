// ==========================================================
// controllers/tableController.js
// ==========================================================
// テーブル（座席）管理：一覧/作成/更新/削除/座標更新/状態更新
// ==========================================================

const Table = require("../models/Table");

// 一覧（storeId スコープ）
exports.getTables = async (req, res) => {
  try {
    const data = await Table.find({ storeId: req.storeId }).sort({ name: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 作成
exports.createTable = async (req, res) => {
  try {
    const payload = { ...req.body, storeId: req.storeId };
    const t = await Table.create(payload);
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 更新
exports.updateTable = async (req, res) => {
  try {
    const t = await Table.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      req.body,
      { new: true }
    );
    if (!t) return res.status(404).json({ message: "Table not found" });
    res.json(t);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 削除
exports.deleteTable = async (req, res) => {
  try {
    const t = await Table.findOneAndDelete({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!t) return res.status(404).json({ message: "Table not found" });
    res.json({ message: "Table deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 座標更新（ドラッグ&ドロップ保存）
exports.updateLayout = async (req, res) => {
  try {
    const { x, y } = req.body;
    const t = await Table.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      { layout: { x, y } },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: "Table not found" });
    res.json(t);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 状態更新（vacant/reserved/occupied）
exports.updateStatus = async (req, res) => {
  try {
    const { status, currentReservation } = req.body;
    const t = await Table.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      { status, currentReservation: currentReservation || null },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: "Table not found" });
    res.json(t);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
