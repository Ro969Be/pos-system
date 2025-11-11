# AGENTS.md — POS システム開発ガイド（Vue3 + Node.js + Express + MongoDB）

## ゴール

- 多店舗対応 POS/予約/注文管理。キッチンモニター、配膳、着手アラート、在庫、クーポン等。
- 変更は **最小差分**・**安全に**・**人間の承認を前提**で進める。

## リポジトリ前提

- Backend: Node.js + Express + Mongoose（`backend/`）
- Frontend: Vue 3 + Vite（`frontend/`）
- 開発標準:
  - JS/TS: camelCase、JSDoc コメント
  - API: REST /api/\*\*、エラーハンドリングは `next(err)` 統一
  - Mongoose: バリデーション + index。破壊的変更は migration 指示を添付
  - Socket.IO: リアルタイム更新（キッチン/ホール）

## 方針（必読）

- **勝手に実行/インストールしない**（提案 → 承認 → 実行）。
- 触る範囲を明示（例：「frontend/src/views/public のみ」）。
- 変更前後の **diff を必ず提示**。テスト実行コマンドも提示。
- 既存 CSS/コンポーネント命名を尊重。UI 崩れを起こさない。
- 秘密情報（.env 等）には触れない・作らない。

## ディレクトリ

- `backend/src/models|controllers|routes|middleware`
- `frontend/src/views|components|styles`
- 共通: `.env` はローカルのみ。`CORS_ORIGIN` は配列分割対応。

## テスト

- Backend: Jest + Supertest（提案時に追加）
- Frontend: Vitest + Vue Test Utils（必要に応じて提案）

## 変更の出力形式

1. 目的と概要（要約）
2. 追加/変更ファイル一覧
3. 差分（コードブロック）
4. 実行手順（npm scripts, curl 例）
5. ロールバック方法（git コマンド）

## 禁止事項

- 説明なしの大規模リライト
- 依存追加の無断実行
- ビルド/DB 破壊的操作の無断実行

## よく使うタスク例

- モデル拡張（注文 → 調理済み → 配膳済みの遷移）
- 提供時間ベースのアラート（カテゴリ/商品別 SLA）
- 予約/座席在庫/税率(8/10%)ロジック
