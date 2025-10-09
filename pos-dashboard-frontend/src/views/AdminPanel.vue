<template>
  <div class="space-y-2">
    <button @click="downloadReport('sales-list/daily')" class="px-4 py-2 bg-blue-500 text-white rounded">
      日次売上一覧 (CSV)
    </button>
    <button @click="downloadReport('sales-summary/monthly')" class="px-4 py-2 bg-green-500 text-white rounded">
      月次売上集計 (PDF)
    </button>
    <button @click="downloadReportRange('2025-10-01','2025-10-31')" class="px-4 py-2 bg-gray-500 text-white rounded">
      期間指定 (CSV)
    </button>
  </div>
</template>

<script setup lang="ts">
import api from "@/api/axios"; // ← api を使っているのでインポート必須

async function downloadReport(endpoint: string) {
  const res = await api.get(`/reports/${endpoint}`, { responseType: "blob" });
  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = endpoint.includes("summary") ? "report.pdf" : "report.csv";
  link.click();
}

async function downloadReportRange(start: string, end: string) {
  const res = await api.get(`/reports/sales-list/range?startDate=${start}&endDate=${end}`, { responseType: "blob" });
  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `report-${start}_${end}.csv`;
  link.click();
}
</script>
