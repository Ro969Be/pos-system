import Staff from "../models/Staff.js";
import Store from "../models/Store.js";

export async function listStaff(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const rows = await Staff.find({ storeId })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();
    res.json(rows.map((x) => ({ ...x, id: String(x._id) })));
  } catch (e) {
    next(e);
  }
}

export async function createStaff(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { name, email, phone, role, password } = req.body;
    const s = new Staff({
      storeId,
      name,
      email,
      phone,
      role,
      passwordHash: "",
    });
    await s.setPassword(password);
    await s.save();
    res.status(201).json({ id: String(s._id) });
  } catch (e) {
    next(e);
  }
}

export async function updateStaff(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    const { name, email, phone, role, password } = req.body;
    const s = await Staff.findOne({ _id: id, storeId });
    if (!s) return res.status(404).json({ message: "Not found" });
    if (name) s.name = name;
    if (email) s.email = email;
    if (phone) s.phone = phone;
    if (role) s.role = role;
    if (password) await s.setPassword(password);
    await s.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function deleteStaff(req, res, next) {
  try {
    const storeId = req.user.storeId;
    const { id } = req.params;
    await Staff.deleteOne({ _id: id, storeId });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
