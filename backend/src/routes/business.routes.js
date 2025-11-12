import { Router } from "express";
import {
  registerOwnerAny,
  requestBusinessPasswordLink,
  setBusinessPassword,
  businessLogin,
  selectStore,
} from "../controllers/business.controller.js";
import { requireAuth, requireBusinessAuth } from "../middleware/auth.js";

const r = Router();

// 新規オーナー登録（未ログインでも可／ログイン中は既存Userを使用）
r.post("/register-owner", registerOwnerAny);

// ログイン中一般ユーザーが、ビジネス用パス設定リンクを受け取る
r.post("/password/request", requireAuth, requestBusinessPasswordLink);

// ワンタイムリンク到達後のパス設定
r.post("/password/set", setBusinessPassword);

// ログイン（ビジネスID＝ userId 文字列 or 旧 loginId）
r.post("/login", businessLogin);

// 店舗選択
r.post("/select-store", requireBusinessAuth, selectStore);

export default r;
