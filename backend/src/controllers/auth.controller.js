import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";
import Store from "../models/Store.js";
import bcrypt from "bcryptjs";

export async function registerStaff(req, res, next) {
  try {
    const {
      storeCode,
      name,
      email,
      phone,
      password,
      role = "staff",
    } = req.body;
    const store = await Store.findOne({ code: storeCode });
    if (!store) return res.status(400).json({ message: "Store not found" });

    const exists = await Staff.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });

    const staff = new Staff({
      storeId: store._id,
      name,
      email,
      phone,
      role,
      passwordHash: "",
    });
    await staff.setPassword(password);
    await staff.save();

    res.status(201).json({ id: staff._id });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await staff.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { staffId: staff._id, role: staff.role, storeId: staff.storeId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    res.json({ token });
  } catch (e) {
    next(e);
  }
}
