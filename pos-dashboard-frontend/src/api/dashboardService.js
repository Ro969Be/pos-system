// ==========================================================
// src/api/dashboardService.js
// ----------------------------------------------------------
// 売上ダッシュボード関連のAPI通信を一元管理するサービス層
// ==========================================================

import axios from "axios";

// ==========================================================
// 基本設定
// ==========================================================
const API_BASE_URL = "http://localhost:5000/api/sales-dashboard";

// axios共通設定
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================================
// 売上サマリー（今日 / 週 / 月）
// ==========================================================
export async function fetchDashboardSummary() {
  const res = await api.get("/summary");
  return res.data;
}

// ==========================================================
// 売上日別詳細
// ==========================================================
export async function fetchDailyDetail(date) {
  const res = await api.get(`/detail/${date}`);
  return res.data;
}

// ==========================================================
// 店舗別売上詳細
// ==========================================================
export async function fetchStoreDetail(date, storeId) {
  const res = await api.get(`/detail/${date}/${storeId}`);
  return res.data;
}
