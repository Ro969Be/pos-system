// ==========================================================
// controllers/reservationController.js
// ==========================================================
// 予約管理：一覧/作成/更新/削除
// - 予約作成時に電話番号で Customer を照合して自動紐付け（存在すれば）
// - 自動配席（utils/seating.js）
// - 席在庫（Table.status）連動
// ==========================================================

const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const Customer = require("../models/Customer");
const { autoAssignTables } = require("../utils/seating");

// 一覧
exports.getReservations = async (req, res) => {
  try {
    const { from, to } = req.query; // 期間フィルタ（任意）
    const match = { storeId: req.storeId };
    if (from && to) {
      match.dateTime = { $gte: new Date(from), $lte: new Date(to) };
    }
    const data = await Reservation.find(match)
      .populate("tableIds")
      .sort({ dateTime: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 1件取得
exports.getReservation = async (req, res) => {
  try {
    const r = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    }).populate("tableIds");
    if (!r) return res.status(404).json({ message: "Reservation not found" });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 作成（自動配席）
exports.createReservation = async (req, res) => {
  try {
    const { name, phone, dateTime, partySize, courseType, courseName, notes } =
      req.body;

    // 1) 電話番号照合 → 既存顧客なら紐付け
    const customer = await Customer.findOne({ phone, storeId: req.storeId });

    // 2) 空席テーブル取得（当日は全 vacant を対象、より高度には時間帯で占有チェックも可能）
    const tables = await Table.find({ storeId: req.storeId });

    // 3) 自動配席（最小空席ロス）
    const selectedTableIds = autoAssignTables(tables, partySize);
    if (selectedTableIds.length === 0) {
      return res.status(409).json({ message: "空き席が不足しています" });
    }

    // 4) 予約作成
    const r = await Reservation.create({
      storeId: req.storeId,
      name,
      phone,
      customer: customer ? customer._id : null,
      dateTime,
      partySize,
      courseType: courseType || "seatOnly",
      courseName: courseName || "",
      notes: notes || "",
      tableIds: selectedTableIds,
      status: "reserved",
    });

    // 5) 席在庫更新（reserved）
    await Table.updateMany(
      { _id: { $in: selectedTableIds } },
      { $set: { status: "reserved", currentReservation: r._id } }
    );

    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 更新（手動配席変更やメモ更新など）
exports.updateReservation = async (req, res) => {
  try {
    const payload = { ...req.body };

    // 席の差分がある場合、古い席を vacant に戻し、新しい席を reserved に
    if (payload.tableIds) {
      const before = await Reservation.findOne({
        _id: req.params.id,
        storeId: req.storeId,
      });
      if (!before)
        return res.status(404).json({ message: "Reservation not found" });

      const beforeSet = new Set((before.tableIds || []).map(String));
      const afterSet = new Set(payload.tableIds.map(String));

      const toVacant = [...beforeSet].filter((id) => !afterSet.has(id));
      const toReserve = [...afterSet].filter((id) => !beforeSet.has(id));

      if (toVacant.length)
        await Table.updateMany(
          { _id: { $in: toVacant } },
          { $set: { status: "vacant", currentReservation: null } }
        );

      if (toReserve.length)
        await Table.updateMany(
          { _id: { $in: toReserve } },
          { $set: { status: "reserved" } }
        );
    }

    const r = await Reservation.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      payload,
      { new: true }
    ).populate("tableIds");

    if (!r) return res.status(404).json({ message: "Reservation not found" });
    res.json(r);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// キャンセル（予約取消→席を vacant に戻す）
exports.cancelReservation = async (req, res) => {
  try {
    const r = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!r) return res.status(404).json({ message: "Reservation not found" });

    await Table.updateMany(
      { _id: { $in: r.tableIds } },
      { $set: { status: "vacant", currentReservation: null } }
    );

    r.status = "cancelled";
    await r.save();

    res.json({ message: "予約をキャンセルしました", reservation: r });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 来店（席を occupied に）
exports.seatReservation = async (req, res) => {
  try {
    const r = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!r) return res.status(404).json({ message: "Reservation not found" });

    await Table.updateMany(
      { _id: { $in: r.tableIds } },
      { $set: { status: "occupied", currentReservation: r._id } }
    );

    r.status = "seated";
    await r.save();

    res.json({ message: "来店処理を完了しました", reservation: r });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 会計完了（席を vacant に）※会計確定時にも別途実施可
exports.completeReservation = async (req, res) => {
  try {
    const r = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!r) return res.status(404).json({ message: "Reservation not found" });

    await Table.updateMany(
      { _id: { $in: r.tableIds } },
      { $set: { status: "vacant", currentReservation: null } }
    );

    r.status = "completed";
    await r.save();

    res.json({ message: "会計完了処理を実施しました", reservation: r });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
