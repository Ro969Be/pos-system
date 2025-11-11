import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const BusinessSchema = new mongoose.Schema(
  {
    // ✅ 新仕様：一般ユーザーと1:1で紐づく
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },

    // 組織名（UI上の表示名）
    orgName: { type: String, required: true },

    // 互換：旧実装のログインID（owner1 等）。当面残すが、将来は userId 文字列に統一予定。
    loginId: { type: String, unique: true, sparse: true },

    // 連絡先（任意）
    email: { type: String, sparse: true },
    phone: { type: String, sparse: true },

    // ビジネス用パス（リンクで設定）
    passwordHash: { type: String }, // ← 新規作成直後は未設定でもよい
  },
  { timestamps: true }
);

BusinessSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

BusinessSchema.methods.comparePassword = function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("Business", BusinessSchema);
