import Store from "../models/Store.js";

export async function createStore(req, res, next) {
  try {
    const { name, code, phone, address } = req.body;
    const exists = await Store.findOne({ code });
    if (exists)
      return res.status(409).json({ message: "Store code already exists" });
    const store = await Store.create({ name, code, phone, address });
    res.status(201).json(store);
  } catch (e) {
    next(e);
  }
}

export async function getMyStore(req, res, next) {
  try {
    const store = await Store.findById(req.user.storeId);
    res.json(store);
  } catch (e) {
    next(e);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const { sla, serviceStartHour } = req.body;

    const set = {};
    if (typeof serviceStartHour === "number") {
      set["settings.serviceStartHour"] = serviceStartHour;
    }
    if (sla && typeof sla === "object") {
      for (const k of ["drink", "food", "dessert"]) {
        if (typeof sla[k] === "number") set[`settings.sla.${k}`] = sla[k];
      }
    }

    const doc = await Store.findByIdAndUpdate(
      req.user.storeId,
      { $set: set },
      { new: true }
    ).lean();

    res.json(doc?.settings ?? {});
  } catch (e) {
    next(e);
  }
}
