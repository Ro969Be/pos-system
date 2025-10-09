const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT生成関数
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ログイン処理
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "ユーザーが見つかりません" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "パスワードが違います" });

    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 新規ユーザー登録（admin だけ admin 作成可能）
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "既に登録済みです" });

    // role=admin の登録は制限する（初回だけ例外にするなど）
    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(403).json({ message: "管理者は既に存在します" });
      }
    }

    const user = new User({ name, email, password, role: role || "staff" });
    await user.save();

    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, register };
