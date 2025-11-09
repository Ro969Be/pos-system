// backend/src/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,

    // 正規化対象（V2の正規化スクリプトで埋める想定）
    email:      { type: String },  // ← index/sparse つけない
    emailLower: { type: String },  // ← index/sparse は schema.index で付与
    phone:      { type: String },  // ← index/sparse つけない
    phoneNorm:  { type: String },  // ← index/sparse は schema.index で付与

    // 複数店舗所属
    storeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
  },
  { timestamps: true }
);

// === インデックスは schema.index() に一本化 ===
// 正規化キーは値が無い doc を省くため sparse 推奨（null/undefined は無視される）
UserSchema.index({ emailLower: 1 }, { name: "emailLower_1", sparse: true });
UserSchema.index({ phoneNorm: 1 }, { name: "phoneNorm_1", sparse: true });

// storeIds の検索用（必要に応じて）
UserSchema.index({ storeIds: 1 }, { name: "storeIds_1" });

export default mongoose.model("User", UserSchema);
