# pos-system

---

## 📦 リポジトリ構成

```
pos-system/
├─ backend/        # Node.js + Express + MongoDB (Mongoose) node.js
│  ├─ server.js
│  └─ src/
│     ├─ models/
│     ├─ controllers/
│     └─ routes/
└─ frontend/       # Vue 3 + Vite
   ├─ index.html
   └─ src/
      ├─ lib/api.js
      ├─ App.vue
      └─ views/
```

---

## 🛠 技術スタック

- **Backend**: Node.js (ESM) (v24.11.0), Express, Mongoose, dotenv, CORS
- **Database**: MongoDB Atlas（クラウド）/ ローカル MongoDB のどちらでも可
- **Frontend**: Vue 3, Vite, Axios,（必要に応じて Vue Router / Pinia）

---

## ✅ 現在の状態（2025-11-02）

- Backend サーバー起動とヘルスチェック (`GET /`) のみ確認済み。
- 今後の機能（未実装事項は本 README に記載しません）。

---

## 🚀 セットアップ

### 1) 事前準備

- Node.js v18+（推奨）
- MongoDB Atlas アカウント（またはローカル MongoDB）
- Windows で PowerShell エラーが出る場合：
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### 2) クローン & 依存インストール

```bash
cd pos-system
# Backend
cd backend
npm install
# Frontend
cd ../frontend
npm install
```

### 3) 環境変数の設定（.env）

**backend/.env**

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
```

**frontend/.env**（Vite は `VITE_` で始まる変数のみ参照可）

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4) 開発サーバー起動

```bash
# Backend
cd backend
npm run dev
# Frontend（別ターミナル）
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

（オプション）ルート直下で同時起動：

```bash
npm install -D concurrently
```

`pos-system/package.json`

```json
{
  "name": "pos-system",
  "private": true,
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\""
  }
}
```

---

## 🔌 API（現状）

### ヘルスチェック

```
GET /
```

**レスポンス例**

```
Backend API working!
```

> その他の API は実装後に追記します。

---

## 🗄️ DB 接続方法（MongoDB）

### 1) Atlas（クラウド）に接続する場合

1. MongoDB Atlas で **Database Access** にユーザーを作成
2. **Network Access** で接続元 IP を許可（開発中は `0.0.0.0/0` でも可・公開リポジトリに URI を載せない）
3. 接続文字列（Connection String）をコピーして `backend/.env` の `MONGO_URI` に貼付
4. `npm run dev` でバックエンド起動 → コンソールに `MongoDB connected` が出れば成功

**例**

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxxx.mongodb.net/posdb?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
```

### 2) ローカル MongoDB に接続する場合

`backend/.env`

```env
MONGO_URI=mongodb://127.0.0.1:27017/pos
PORT=5000
```

### 3) よくあるハマりどころ

- `.env` を `backend/.env` に置く（プロジェクト直下ではなく）
- 1 行に 1 変数で記述（`MONGO_URI=...` と `PORT=5000` を同一行にしない）
- `server.js` の最上部で `dotenv.config()` を実行
- Atlas で IP 許可が入っているか確認

---

## 🧪 動作確認チェックリスト（現状）

- [ ] `backend/.env` が 1 行 1 変数で記述されている
- [ ] `npm run dev` でバックエンド起動し、`MongoDB connected` が出る
- [ ] フロントの `.env` に `VITE_API_BASE_URL` が設定されている
- [ ] `http://localhost:5173/` を開くと `Backend API working!` が表示される

---

## 🧰 トラブルシューティング

- **PowerShell で npm が実行できない**：
  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- **`MONGO_URI undefined`**：`.env` の場所が `backend/.env` か、1 行 1 変数になっているかを確認
- **Atlas に接続できない**：Network Access に現在の IP を追加、または `0.0.0.0/0` を一時許可
- **CORS エラー**：`app.use(cors())`、必要なら `cors({ origin: 'http://localhost:5173' })`
- **.env が反映されない**：開発サーバーを再起動（Vite / nodemon）

---

## 📝 コーディング規約（簡易）

- Node は **ES Module**（`type: "module"`）
- フォーマット：Prettier（今後導入）
- ブランチ戦略：`main`（安定） / `feature/*`（機能実装後に随時）
- コミット：英語 or 日本語 OK、粒度は小さく簡潔に

---

（注）この README は **現状動いている範囲のみ**を記載しています。新機能が実装され次第、該当章を追記します。
