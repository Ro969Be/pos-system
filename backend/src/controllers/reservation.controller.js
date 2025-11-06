import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";

/** 時間帯重複: (a.start < b.end) && (a.end > b.start) */
function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/** 指定時間帯の占有テーブルMap（自分自身 excludeId を除外可能） */
async function occupiedMap(storeId, from, to, excludeId = null) {
  const list = await Reservation.find({
    storeId,
    status: { $in: ["booked", "seated"] },
    $or: [{ start: { $lt: to } }, { end: { $gt: from } }],
  }).lean();

  const map = new Map();
  for (const r of list) {
    if (excludeId && String(r._id) === String(excludeId)) continue; // ← 自分を除外
    if (!r.tableId) continue;
    if (overlap(from, to, r.start, r.end)) map.set(String(r.tableId), true);
  }
  return map;
}

/** 最小十分席（capacity>=people の最小）から、空きを選ぶ。excludeId で自分を除外可能 */
async function pickTable(storeId, people, from, to, excludeId = null) {
  const tables = await Table.find({ storeId }).sort({ capacity: 1 }).lean();
  if (!tables.length) return null;

  const occ = await occupiedMap(storeId, from, to, excludeId);
  return (
    tables.filter((t) => t.capacity >= people && !occ.get(String(t._id)))[0] ||
    null
  );
}

/** 予約作成（自動割当） */
export async function createReservation(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const {
      name,
      phone = "",
      email = "",
      people,
      date,
      durationMin = 120,
      notes = "",
    } = req.body;

    if (!name || !people || !date)
      return res
        .status(400)
        .json({ message: "name, people, date are required" });

    const start = new Date(date);
    if (isNaN(start.getTime()))
      return res.status(400).json({ message: "invalid date" });
    const end = new Date(start.getTime() + Number(durationMin) * 60000);

    const table = await pickTable(storeId, Number(people), start, end);
    if (!table)
      return res
        .status(409)
        .json({ message: "No available table for the timeframe" });

    const doc = await Reservation.create({
      storeId,
      name,
      phone,
      email,
      people,
      start,
      end,
      tableId: table._id,
      notes,
      status: "booked",
    });

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

/** 可用性チェック: /api/reservations/availability?date=...&people=2&durationMin=120[&excludeId=...] */
export async function checkAvailability(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { date, people, durationMin = 120, excludeId = null } = req.query;
    if (!date || !people)
      return res.status(400).json({ message: "date and people are required" });

    const start = new Date(date);
    if (isNaN(start.getTime()))
      return res.status(400).json({ message: "invalid date" });
    const end = new Date(start.getTime() + Number(durationMin) * 60000);

    const table = await pickTable(
      storeId,
      Number(people),
      start,
      end,
      excludeId || null
    );
    return res.json({ available: !!table, table });
  } catch (e) {
    next(e);
  }
}

/** 範囲取得: /api/reservations?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function listReservations(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const from = req.query.from
      ? new Date(req.query.from)
      : new Date(new Date().toISOString().slice(0, 10));
    const to = req.query.to
      ? new Date(req.query.to)
      : new Date(from.getTime() + 24 * 60 * 60000);

    const docs = await Reservation.find({
      storeId,
      $or: [{ start: { $lt: to } }, { end: { $gt: from } }],
    })
      .sort({ start: 1 })
      .lean();

    res.json({ value: docs, Count: docs.length });
  } catch (e) {
    next(e);
  }
}

/** 予約更新
 *  - people/start/duration が変わらない → 席は維持（name/notes などだけ更新）
 *  - 変わる場合 → excludeId を使って自分を除外しつつ再割当
 */
export async function updateReservation(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    const patch = req.body;

    const cur = await Reservation.findOne({ _id: id, storeId }).lean();
    if (!cur) return res.status(404).json({ message: "Reservation not found" });

    // 変更後の値を計算
    const nextPeople = Number(patch.people ?? cur.people);
    const startRaw = patch.start ?? patch.date ?? cur.start;
    const nextStart = new Date(startRaw);
    if (isNaN(nextStart.getTime()))
      return res.status(400).json({ message: "invalid date" });
    const nextDur = Number(patch.durationMin ?? (cur.end - cur.start) / 60000);
    const nextEnd = new Date(nextStart.getTime() + nextDur * 60000);

    const peopleChanged = nextPeople !== cur.people;
    const timeChanged =
      nextStart.getTime() !== new Date(cur.start).getTime() ||
      nextEnd.getTime() !== new Date(cur.end).getTime();

    let nextTableId = cur.tableId;

    if (peopleChanged || timeChanged) {
      const table = await pickTable(
        storeId,
        nextPeople,
        nextStart,
        nextEnd,
        id
      ); // 自分を除外
      if (!table)
        return res
          .status(409)
          .json({ message: "No available table for the timeframe" });
      nextTableId = table._id;
    } else {
      // 席は維持
      nextTableId = cur.tableId;
    }

    const doc = await Reservation.findOneAndUpdate(
      { _id: id, storeId },
      {
        $set: {
          people: nextPeople,
          start: nextStart,
          end: nextEnd,
          tableId: nextTableId,
          name: patch.name ?? cur.name,
          phone: patch.phone ?? cur.phone,
          email: patch.email ?? cur.email,
          notes: patch.notes ?? cur.notes,
        },
      },
      { new: true }
    ).lean();

    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/** 予約キャンセル */
export async function cancelReservation(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    const doc = await Reservation.findOneAndUpdate(
      { _id: id, storeId },
      { $set: { status: "cancelled" } },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Reservation not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
