// ==========================================================
// controllers/shiftController.js
// ==========================================================
const Shift = require("../models/Shift");

// 一覧（期間）
exports.list = async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { storeId: req.storeId };
    if (from && to) match.date = { $gte: new Date(from), $lte: new Date(to) };
    const data = await Shift.find(match).sort({ date: 1, startTime: 1 });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 作成
exports.create = async (req, res) => {
  try {
    const payload = { ...req.body, storeId: req.storeId };
    const doc = await Shift.create(payload);
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// 更新
exports.update = async (req, res) => {
  try {
    const updated = await Shift.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Shift not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// 削除
exports.remove = async (req, res) => {
  try {
    const del = await Shift.findOneAndDelete({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!del) return res.status(404).json({ message: "Shift not found" });
    res.json({ message: "deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
