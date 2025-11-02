// ----------------------
// 環境変数の読み込み
// ----------------------
import dotenv from 'dotenv';
dotenv.config(); // .env を読み込む（defaultで同じディレクトリ）

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------
// .env から値を取得
// ----------------------
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// --- 環境変数が無い場合のチェック（デバッグ用）---
if (!MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI が .env から読み込めていません。');
  process.exit(1);
}

// ----------------------
// MongoDB 接続開始
// ----------------------
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// ----------------------
// テスト用ルート
// ----------------------
app.get('/', (req, res) => {
  res.send('Backend API working!');
});
