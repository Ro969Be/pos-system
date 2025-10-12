// backend/controllers/categoryPresetController.js
// カテゴリー提供時間プリセットの CRUD（Socket.io で変更を通知する）
// コメントは残しています。

const CategoryPreset = require("../models/CategoryPreset");

// 一覧取得（activeOnly オプション）
exports.listPresets = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === "true" ? { isActive: true } : {};
    const presets = await CategoryPreset.find(filter).sort({ category: 1 });
    res.json(presets);
  } catch (err) {
    console.error("❌ listPresets error:", err);
    res.status(500).json({ message: "プリセット取得に失敗しました" });
  }
};

// 単一取得
exports.getPreset = async (req, res) => {
  try {
    const preset = await CategoryPreset.findById(req.params.id);
    if (!preset) return res.status(404).json({ message: "プリセットが見つかりません" });
    res.json(preset);
  } catch (err) {
    console.error("❌ getPreset error:", err);
    res.status(500).json({ message: "プリセット取得に失敗しました" });
  }
};

// 作成（作成後に Socket.io で全クライアントへ通知）
exports.createPreset = async (req, res) => {
  try {
    const { category, provideTime, description, isActive } = req.body;
    if (!category || provideTime == null) {
      return res.status(400).json({ message: "category と provideTime は必須です" });
    }

    const exists = await CategoryPreset.findOne({ category });
    if (exists) {
      return res.status(400).json({ message: "そのカテゴリーのプリセットは既に存在します" });
    }

    const preset = new CategoryPreset({
      category,
      provideTime,
      description,
      isActive: isActive ?? true,
    });

    const saved = await preset.save();

    // Socket.io emit（appに設定されたioを利用）
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("categoryPresetChanged", { action: "create", preset: saved });
      }
    } catch (e) {
      console.error("⚠️ Socket emit error on createPreset:", e);
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ createPreset error:", err);
    res.status(500).json({ message: "プリセット作成に失敗しました" });
  }
};

// 更新（部分更新を許可、更新後に Socket.io 通知）
exports.updatePreset = async (req, res) => {
  try {
    const updates = {};
    const { provideTime, description, isActive } = req.body;
    if (provideTime !== undefined) updates.provideTime = provideTime;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await CategoryPreset.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "プリセットが見つかりません" });

    // Socket.io emit
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("categoryPresetChanged", { action: "update", preset: updated });
      }
    } catch (e) {
      console.error("⚠️ Socket emit error on updatePreset:", e);
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ updatePreset error:", err);
    res.status(500).json({ message: "プリセット更新に失敗しました" });
  }
};

// 削除（物理削除）および通知
exports.deletePreset = async (req, res) => {
  try {
    const removed = await CategoryPreset.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "プリセットが見つかりません" });

    // Socket.io emit
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit("categoryPresetChanged", { action: "delete", presetId: removed._id });
      }
    } catch (e) {
      console.error("⚠️ Socket emit error on deletePreset:", e);
    }

    res.json({ message: "削除しました" });
  } catch (err) {
    console.error("❌ deletePreset error:", err);
    res.status(500).json({ message: "プリセット削除に失敗しました" });
  }
};
