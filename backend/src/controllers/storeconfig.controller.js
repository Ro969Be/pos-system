// backend/src/controllers/storeconfig.controller.js
import Store from "../models/Store.js";
import Station from "../models/Station.js";
import Category from "../models/Category.js";
import Register from "../models/Register.js";
import MobileOrderSetting from "../models/MobileOrderSetting.js";
import Table from "../models/Table.js";

// ---- 店舗詳細
export async function getStoreDetail(req, res, next) {
  try {
    const s = await Store.findById(req.user.storeId).lean();
    res.json(
      s
        ? {
            id: String(s._id),
            name: s.name,
            code: s.code,
            type: s.type,
            phone: s.phone,
            address: s.address,
            settings: s.settings,
          }
        : null
    );
  } catch (e) {
    next(e);
  }
}

export async function updateStoreDetail(req, res, next) {
  try {
    const { type, name, phone, address, serviceStartHour } = req.body;
    const set = {};
    if (type) set.type = type;
    if (name) set.name = name;
    if (phone) set.phone = phone;
    if (address) set.address = address;
    if (typeof serviceStartHour === "number")
      set["settings.serviceStartHour"] = serviceStartHour;

    const doc = await Store.findByIdAndUpdate(
      req.user.storeId,
      { $set: set },
      { new: true }
    );
    res.json({ ok: true, store: doc });
  } catch (e) {
    next(e);
  }
}

// ---- カテゴリ
export async function listCategories(req, res, next) {
  try {
    const rows = await Category.find({
      storeId: req.user.storeId,
      isActive: true,
    })
      .sort({ name: 1 })
      .lean();
    res.json(rows.map((x) => ({ id: String(x._id), name: x.name })));
  } catch (e) {
    next(e);
  }
}

export async function createCategory(req, res, next) {
  try {
    const row = await Category.create({
      storeId: req.user.storeId,
      name: req.body.name,
    });
    res.status(201).json({ id: String(row._id) });
  } catch (e) {
    next(e);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await Category.deleteOne({ _id: req.params.id, storeId: req.user.storeId });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

// ---- ステーション（キッチン/ドリンク/ホール）
export async function listStations(req, res, next) {
  try {
    const rows = await Station.find({ storeId: req.user.storeId })
      .sort({ sortOrder: 1 })
      .lean();
    res.json(
      rows.map((x) => ({
        id: String(x._id),
        name: x.name,
        role: x.role,
        categories: x.categories.map(String),
        slaOverrideMinutes: Object.fromEntries(x.slaOverrideMinutes || []),
        sortOrder: x.sortOrder,
      }))
    );
  } catch (e) {
    next(e);
  }
}

export async function createStation(req, res, next) {
  try {
    const { name, role, categories = [], slaOverrideMinutes = {} } = req.body;
    const row = await Station.create({
      storeId: req.user.storeId,
      name,
      role,
      categories,
      slaOverrideMinutes,
    });
    res.status(201).json({ id: String(row._id) });
  } catch (e) {
    next(e);
  }
}

export async function updateStation(req, res, next) {
  try {
    const { name, role, categories, slaOverrideMinutes, sortOrder } = req.body;
    const set = {};
    if (name) set.name = name;
    if (role) set.role = role;
    if (categories) set.categories = categories;
    if (slaOverrideMinutes) set.slaOverrideMinutes = slaOverrideMinutes;
    if (typeof sortOrder === "number") set.sortOrder = sortOrder;

    await Station.updateOne(
      { _id: req.params.id, storeId: req.user.storeId },
      { $set: set }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function deleteStation(req, res, next) {
  try {
    await Station.deleteOne({
      _id: req.params.id,
      storeId: req.user.storeId,
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

// ---- レジ
export async function listRegisters(req, res, next) {
  try {
    const rows = await Register.find({ storeId: req.user.storeId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(
      rows.map((x) => ({
        id: String(x._id),
        name: x.name,
        taxMode: x.taxMode,
        printerIP: x.printerIP,
      }))
    );
  } catch (e) {
    next(e);
  }
}

export async function createRegister(req, res, next) {
  try {
    const { name, pass, printerIP, taxMode } = req.body;
    const row = await Register.create({
      storeId: req.user.storeId,
      name,
      pass,
      printerIP,
      taxMode,
    });
    res.status(201).json({ id: String(row._id) });
  } catch (e) {
    next(e);
  }
}

export async function updateRegister(req, res, next) {
  try {
    const { name, pass, printerIP, taxMode } = req.body;
    const set = {};
    if (name) set.name = name;
    if (pass) set.pass = pass;
    if (printerIP) set.printerIP = printerIP;
    if (taxMode) set.taxMode = taxMode;

    await Register.updateOne(
      { _id: req.params.id, storeId: req.user.storeId },
      { $set: set }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function deleteRegister(req, res, next) {
  try {
    await Register.deleteOne({
      _id: req.params.id,
      storeId: req.user.storeId,
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

// ---- モバイルオーダー
export async function getMobileOrder(req, res, next) {
  try {
    let s = await MobileOrderSetting.findOne({
      storeId: req.user.storeId,
    }).lean();
    if (!s) s = await MobileOrderSetting.create({ storeId: req.user.storeId });
    // lean() の戻りは plain object、create の戻りは doc なので整形
    const obj = s._id ? s.toObject?.() ?? s : s;
    res.json({ id: String(obj._id), ...obj });
  } catch (e) {
    next(e);
  }
}

export async function updateMobileOrder(req, res, next) {
  try {
    const { enabled, pickupEnabled, deliveryEnabled, note } = req.body;
    const set = {};
    if (typeof enabled === "boolean") set.enabled = enabled;
    if (typeof pickupEnabled === "boolean") set.pickupEnabled = pickupEnabled;
    if (typeof deliveryEnabled === "boolean")
      set.deliveryEnabled = deliveryEnabled;
    if (typeof note === "string") set.note = note;

    const doc = await MobileOrderSetting.findOneAndUpdate(
      { storeId: req.user.storeId },
      { $set: set },
      { new: true, upsert: true }
    );
    res.json({ ok: true, setting: doc });
  } catch (e) {
    next(e);
  }
}

// ---- テーブル
export async function listTables(req, res, next) {
  try {
    const rows = await Table.find({ storeId: req.user.storeId })
      .sort({ name: 1 })
      .lean();
    res.json(
      rows.map((x) => ({
        id: String(x._id),
        name: x.name,
        capacity: x.capacity,
      }))
    );
  } catch (e) {
    next(e);
  }
}

export async function createTable(req, res, next) {
  try {
    const { name, capacity } = req.body;
    const row = await Table.create({
      storeId: req.user.storeId,
      name,
      capacity,
    });
    res.status(201).json({ id: String(row._id) });
  } catch (e) {
    next(e);
  }
}

export async function updateTable(req, res, next) {
  try {
    const { name, capacity } = req.body;
    const set = {};
    if (name) set.name = name;
    if (typeof capacity === "number") set.capacity = capacity;

    await Table.updateOne(
      { _id: req.params.id, storeId: req.user.storeId },
      { $set: set }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function deleteTable(req, res, next) {
  try {
    await Table.deleteOne({ _id: req.params.id, storeId: req.user.storeId });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
