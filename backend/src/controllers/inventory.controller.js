import Inventory from "../models/Inventory.js";
import MenuItem from "../models/MenuItem.js";

/**
 * 在庫 作成 or 更新（存在すれば更新、なければ作成）
 * POST /api/inventory
 * body: { menuItemId, qty, lowThreshold }
 */
export async function upsertInventory(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { menuItemId, qty, lowThreshold } = req.body;

    if (!menuItemId)
      return res.status(400).json({ message: "menuItemId is required" });
    const menu = await MenuItem.findOne({ _id: menuItemId, storeId }).lean();
    if (!menu)
      return res
        .status(404)
        .json({ message: "MenuItem not found in this store" });

    const update = {};
    if (qty !== undefined) update.qty = Math.max(0, Number(qty));
    if (lowThreshold !== undefined)
      update.lowThreshold = Math.max(0, Number(lowThreshold));

    const doc = await Inventory.findOneAndUpdate(
      { storeId, menuItemId },
      { $set: update, $setOnInsert: { storeId, menuItemId } },
      { upsert: true, new: true }
    ).lean();

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

/**
 * 在庫 部分更新
 * PATCH /api/inventory/:id
 * body: { qty?, lowThreshold? }
 */
export async function updateInventory(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    const { qty, lowThreshold } = req.body;

    const update = {};
    if (qty !== undefined) update.qty = Math.max(0, Number(qty));
    if (lowThreshold !== undefined)
      update.lowThreshold = Math.max(0, Number(lowThreshold));

    const doc = await Inventory.findOneAndUpdate(
      { _id: id, storeId },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ message: "Inventory not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/**
 * 在庫一覧（この店舗ぶん）
 * GET /api/inventory
 * optional query: menuItemId
 */
export async function listInventory(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { menuItemId } = req.query;

    const where = { storeId };
    if (menuItemId) where.menuItemId = menuItemId;

    const docs = await Inventory.find(where).lean();
    res.json(docs);
  } catch (e) {
    next(e);
  }
}

/**
 * 在庫 取得（メニューID単位）
 * GET /api/inventory/by-menu/:menuItemId
 */
export async function getInventoryByMenu(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { menuItemId } = req.params;
    const doc = await Inventory.findOne({ storeId, menuItemId }).lean();
    if (!doc) return res.status(404).json({ message: "Inventory not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/**
 * 在庫 削除
 * DELETE /api/inventory/:id
 */
export async function deleteInventory(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    const doc = await Inventory.findOneAndDelete({ _id: id, storeId }).lean();
    if (!doc) return res.status(404).json({ message: "Inventory not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
