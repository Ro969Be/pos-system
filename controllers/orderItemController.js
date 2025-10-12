// backend/controllers/orderItemController.js
// 注文アイテムの取得・作成・更新（create時にカテゴリプリセットを参照して provideTime をセットする）

const OrderItem = require("../models/OrderItem");
const CategoryPreset = require("../models/CategoryPreset");
const Product = require("../models/Product"); // 商品に category フィールドがある前提

// ===== 全件取得 （ステーションフィルタ可能）=====
exports.getOrderItems = async (req, res) => {
  try {
    const { station } = req.query;
    const query = station ? { station } : {};
    const items = await OrderItem.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ getOrderItems error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===== 新規作成 =====
// req.body: { product, quantity, table, station, provideTime? }
// - product は商品ID（存在するなら Product モデルから category を取り出す）
// - provideTime が未指定なら category のプリセットを参照して設定する
exports.createOrderItem = async (req, res) => {
  try {
    let { product, quantity, table, station, provideTime } = req.body;

    if (!product || !quantity || !table || !station) {
      return res.status(400).json({ message: "必要なフィールドが不足しています" });
    }

    // 1) product が ID の場合は Product モデルから category を取得
    let productName = product;
    let productCategory = null;

    try {
      const prod = await Product.findById(product).lean();
      if (prod) {
        productName = prod.name || productName;
        productCategory = prod.category || null;
      }
    } catch (err) {
      // product が ID ではない、または DB にない場合は無視して名前文字列として扱える
    }

    // 2) provideTime が明示されていない場合、カテゴリプリセットを参照
    if (provideTime == null) {
      if (productCategory) {
        const preset = await CategoryPreset.findOne({ category: productCategory, isActive: true });
        if (preset) {
          provideTime = preset.provideTime;
        }
      }
      // もしプリセットも無ければ OrderItem モデルの default が使われる（create 時に省略）
    }

    // 3) 実際の保存データ。product には商品名を保存（既存実装に合わせる）
    const toSave = {
      product: productName,
      quantity,
      table,
      station,
    };

    if (provideTime != null) toSave.provideTime = provideTime;

    const newItem = await OrderItem.create(toSave);

    // Socket.io に通知（server 側で io を持っている場合は emit を行うルートで行うのでここではレスポンスだけ）
    res.status(201).json(newItem);
  } catch (err) {
    console.error("❌ createOrderItem error:", err);
    res.status(500).json({ message: "注文作成に失敗しました" });
  }
};

// ===== ステータス更新 =====
exports.updateOrderItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await OrderItem.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "データが見つかりません" });
    res.json(updated);
  } catch (err) {
    console.error("❌ updateOrderItemStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};
