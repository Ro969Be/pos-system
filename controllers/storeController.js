// controllers/storeController.js
// 店舗の登録・取得などを担当するコントローラー
// CommonJS構成対応

const Store = require("../models/Store");

// 店舗新規登録
exports.registerStore = async (req, res) => {
  try {
    const { name, code, address, phone } = req.body;

    // 必須チェック
    if (!name || !code) {
      return res.status(400).json({ message: "店舗名とコードは必須です。" });
    }

    // 既存チェック
    const existing = await Store.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "この店舗コードは既に使用されています。" });
    }

    // 新規登録
    const store = new Store({
      name,
      code,
      address,
      phone,
      owner: req.user ? req.user.id : null, // 認証ユーザーがいれば関連付け
    });

    await store.save();

    res.status(201).json({
      message: "店舗を登録しました",
      store,
    });
  } catch (err) {
    console.error("❌ 店舗登録エラー:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

// 店舗一覧取得
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    res.status(200).json(stores);
  } catch (err) {
    console.error("❌ 店舗一覧取得エラー:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

// 店舗詳細取得
exports.getStoreByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const store = await Store.findOne({ code });
    if (!store) return res.status(404).json({ message: "店舗が見つかりません" });
    res.status(200).json(store);
  } catch (err) {
    console.error("❌ 店舗詳細取得エラー:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};
