// ==========================================================
// controllers/authController.js
// ==========================================================
// 認証コントローラ（Staff / Customer / PublicCustomer対応）
// - 重複登録チェックあり
// - 自動ハッシュ対応（モデルに任せる）
// - JWTにユーザー種別を明示付与
// ==========================================================

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");
const Customer = require("../models/Customer");
const PublicCustomer = require("../models/PublicCustomer");

const generateToken = (user, type) =>
  jwt.sign({ id: user._id, type }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ---------------------------
// Staff登録
// ---------------------------
exports.registerStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await Staff.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "既に登録済みのメールです" });

    const staff = await Staff.create({ name, email, password, role });
    res.status(201).json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Staff登録に失敗しました" });
  }
};

// ---------------------------
// Customer登録
// ---------------------------
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await Customer.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "既に登録済みのメールです" });

    // ✅ 店舗自動取得（最初のStoreをデフォルト利用）
    const Store = require("../models/Store");
    const defaultStore = await Store.findOne();
    if (!defaultStore) {
      return res
        .status(500)
        .json({ message: "店舗情報が存在しません（storeIdが必須です）" });
    }

    const customer = await Customer.create({
      name,
      email,
      password,
      phone,
      storeId: defaultStore._id,
    });

    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Customer登録に失敗しました" });
  }
};

// ---------------------------
// PublicCustomer登録
// ---------------------------
exports.registerPublicCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await PublicCustomer.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "既に登録済みのメールです" });

    const publicUser = await PublicCustomer.create({ name, email, password });
    const token = generateToken(publicUser, "public-customer");
    res.status(201).json({ user: publicUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PublicCustomer登録に失敗しました" });
  }
};

// ---------------------------
// 共通ログイン（type自動判別）
// ---------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ユーザー探索
    const user =
      (await Staff.findOne({ email })) ||
      (await Customer.findOne({ email })) ||
      (await PublicCustomer.findOne({ email }));

    if (!user)
      return res.status(404).json({ message: "メールが登録されていません" });

    // パスワード比較
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "パスワードが不正です" });

    // ユーザー種別判定
    let type = "public-customer";
    if (user instanceof Staff) type = "staff";
    else if (user instanceof Customer) type = "customer";

    // トークン生成
    const token = generateToken(user, type);

    res.status(200).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ログイン処理中にエラーが発生しました" });
  }
};
