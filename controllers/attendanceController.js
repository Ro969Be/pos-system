// ==========================================================
// controllers/attendanceController.js
// ==========================================================
const Attendance = require("../models/Attendance");

// 打刻IN
exports.clockIn = async (req, res) => {
  try {
    const { staffName, memo } = req.body;
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 営業日0:00
    const doc = await Attendance.create({
      storeId: req.storeId,
      staffName,
      date,
      clockIn: now,
      memo: memo || "",
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// 打刻OUT（totalMinutes計算）
exports.clockOut = async (req, res) => {
  try {
    const att = await Attendance.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!att) return res.status(404).json({ message: "Attendance not found" });
    if (att.clockOut)
      return res.status(400).json({ message: "Already clocked out" });

    att.clockOut = new Date();
    // 休憩時間（分）
    const breakMinutes = (att.breaks || []).reduce((sum, b) => {
      if (!b.start || !b.end) return sum;
      return sum + Math.max(0, (new Date(b.end) - new Date(b.start)) / 60000);
    }, 0);

    const minutes = Math.max(
      0,
      (att.clockOut - att.clockIn) / 60000 - breakMinutes
    );
    att.totalMinutes = Math.round(minutes);
    await att.save();

    res.json(att);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// 日別一覧
exports.listByDate = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const d = date ? new Date(date) : new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      23,
      59,
      59,
      999
    );
    const list = await Attendance.find({
      storeId: req.storeId,
      date: { $gte: start, $lte: end },
    }).sort({ clockIn: 1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
