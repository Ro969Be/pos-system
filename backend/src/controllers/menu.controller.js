import MenuItem from "../models/MenuItem.js";
import Inventory from "../models/Inventory.js";

/** メニュー一覧（在庫フラグ付き） */
export async function listMenu(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const items = await MenuItem.find({ storeId, isActive: true }).lean();
    const inv = await Inventory.find({
      storeId,
      menuItemId: { $in: items.map((i) => i._id) },
    }).lean();
    const invMap = new Map(inv.map((x) => [String(x.menuItemId), x]));
    const result = items.map((i) => {
      const inv = invMap.get(String(i._id));
      const qty = inv?.qty ?? null;
      return {
        ...i,
        inventory: {
          qty,
          low: qty !== null && qty <= (inv?.lowThreshold ?? 5),
          hidden: qty === 0,
        },
      };
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

/** 新規作成（確実に _id を返す） */
export async function createMenuItem(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const {
      name,
      category,
      price,
      prepMinutes = 10,
      taxInclusion = "inclusive",
      isActive = true,
    } = req.body;

    const doc = await MenuItem.create({
      storeId,
      name,
      category,
      price,
      prepMinutes,
      taxInclusion,
      isActive,
    });

    res.status(201).json(doc); // ← _id を確実に返す
  } catch (e) {
    next(e);
  }
}

/** 更新（部分更新OK） */
export async function updateMenuItem(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    const data = req.body;
    const doc = await MenuItem.findOneAndUpdate(
      { _id: id, storeId },
      { $set: data },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Menu not found" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

/** 削除 */
export async function deleteMenuItem(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;

    const doc = await MenuItem.findOneAndDelete({ _id: id, storeId });
    if (!doc) return res.status(404).json({ message: "Menu not found" });

    // 連動する在庫も掃除（任意）
    await Inventory.deleteMany({ storeId, menuItemId: id });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
