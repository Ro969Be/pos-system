<template>
  <div class="trend-card">
    <h2>📊 売上トレンド</h2>

    <!-- 期間切り替えボタン -->
    <div class="toggle">
      <button
        v-for="p in periods"
        :key="p.value"
        :class="{ active: p.value === selectedPeriod }"
        @click="selectedPeriod = p.value"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- 棒グラフ -->
    <canvas ref="trendChart"></canvas>

    <!-- 集計テーブル -->
    <table class="summary-table">
      <thead>
        <tr>
          <th>期間</th>
          <th>売上合計</th>
          <th>会計数</th>
          <th>平均単価</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in summaryRows" :key="row.label">
          <td>{{ row.label }}</td>
          <td>¥{{ row.sales.toLocaleString() }}</td>
          <td>{{ row.count }}</td>
          <td>¥{{ row.avg.toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
// ==========================================================
// DashboardTrend.vue
// ----------------------------------------------------------
// 売上トレンドグラフ + 集計表 + 日付切替
// ==========================================================

import { ref, watch, onMounted } from "vue";
import Chart from "chart.js/auto";
import { fetchDashboardSummary } from "../api/dashboardService.js";

// データ状態管理
const periods = [
  { label: "日別", value: "daily" },
  { label: "週別", value: "weekly" },
  { label: "月別", value: "monthly" },
];
const selectedPeriod = ref("weekly");
const summaryRows = ref([]);

const trendChart = ref(null);
let chartInstance = null;

// データ取得
async function loadData() {
  const res = await fetchDashboardSummary();

  // モック変換（実際はresを加工）
  summaryRows.value = [
    { label: "今日", sales: res.today, count: 18, avg: Math.round(res.today / 18) },
    { label: "今週", sales: res.week, count: 52, avg: Math.round(res.week / 52) },
    { label: "今月", sales: res.month, count: 220, avg: Math.round(res.month / 220) },
  ];

  renderChart();
}

// グラフ描画
function renderChart() {
  const ctx = trendChart.value.getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: summaryRows.value.map(r => r.label),
      datasets: [
        {
          label: "売上額",
          data: summaryRows.value.map(r => r.sales),
          backgroundColor: ["#4b9ce2", "#67c587", "#f4c95d"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

watch(selectedPeriod, loadData);
onMounted(loadData);
</script>

<style scoped>
.trend-card {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.toggle button {
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  background: #fafafa;
}
.toggle button.active {
  background: #4b9ce2;
  color: #fff;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.summary-table th, .summary-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.summary-table th {
  background: #f9f9f9;
}
</style>
