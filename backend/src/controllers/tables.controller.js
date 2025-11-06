import Table from "../models/Table.js";

export async function listTables(req, res, next) {
  try {
    const docs = await Table.find({ storeId: req.user.storeId }).lean();
    res.json({ value: docs, Count: docs.length });
  } catch (e) {
    next(e);
  }
}
export async function createTable(req, res, next) {
  try {
    const { name, capacity, type = "table" } = req.body;
    if (!name || !capacity)
      return res
        .status(400)
        .json({ message: "name and capacity are required" });
    const doc = await Table.create({
      storeId: req.user.storeId,
      name,
      capacity,
      type,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}
export async function updateTable(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Table.findOneAndUpdate(
      { _id: id, storeId: req.user.storeId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!doc) return res.status(404).json({ message: "Table not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}
export async function deleteTable(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Table.findOneAndDelete({
      _id: id,
      storeId: req.user.storeId,
    }).lean();
    if (!doc) return res.status(404).json({ message: "Table not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
