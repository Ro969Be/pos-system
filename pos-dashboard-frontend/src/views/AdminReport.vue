<script setup lang="ts">
import api from "@/api/axios";

async function download(endpoint: string, filename: string) {
  const res = await api.get(`/reports/${endpoint}`, {
    responseType: "blob"
  });
  const blob = new Blob([res.data], { type: res.headers["content-type"] });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

// ---- PDF ----
function downloadDailySummary() {
  download("sales-summary/daily", "sales-daily.pdf");
}
function downloadMonthlySummary() {
  download("sales-summary/monthly", "sales-monthly.pdf");
}
function downloadRangeSummary(start: string, end: string, unit: string) {
  download(
    `sales-summary/range?startDate=${start}&endDate=${end}&unit=${unit}`,
    `sales-summary-${start}_${end}.pdf`
  );
}

// ---- CSV ----
function downloadDailyCSV() {
  download("sales-list/daily", "sales-daily.csv");
}
function downloadMonthlyCSV() {
  download("sales-list/monthly", "sales-monthly.csv");
}
function downloadRangeCSV(start: string, end: string) {
  download(
    `sales-list/range?startDate=${start}&endDate=${end}`,
    `sales-list-${start}_${end}.csv`
  );
}
</script>

<template>
  <h2>帳票出力</h2>

  <h3>PDF</h3>
  <button @click="downloadDailySummary">日次サマリー (PDF)</button>
  <button @click="downloadMonthlySummary">月次サマリー (PDF)</button>
  <button @click="downloadRangeSummary('2025-10-01','2025-10-31','daily')">
    期間指定（日次, PDF）
  </button>
  <button @click="downloadRangeSummary('2025-01-01','2025-12-31','monthly')">
    期間指定（月次, PDF）
  </button>

  <h3>CSV</h3>
  <button @click="downloadDailyCSV">日次明細 (CSV)</button>
  <button @click="downloadMonthlyCSV">月次明細 (CSV)</button>
  <button @click="downloadRangeCSV('2025-10-01','2025-10-31')">
    期間指定 (CSV)
  </button>
</template>
