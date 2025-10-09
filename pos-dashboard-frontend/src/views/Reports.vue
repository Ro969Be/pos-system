<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">📊 売上レポート</h1>

    <div class="space-x-4">
      <button @click="downloadCSV('daily')" class="bg-blue-500 text-white px-4 py-2 rounded">
        日次CSV出力
      </button>

      <button @click="downloadCSV('monthly')" class="bg-green-500 text-white px-4 py-2 rounded">
        月次CSV出力
      </button>

      <button @click="downloadPDF('daily')" class="bg-purple-500 text-white px-4 py-2 rounded">
        日次PDF出力
      </button>

      <button @click="downloadPDF('monthly')" class="bg-orange-500 text-white px-4 py-2 rounded">
        月次PDF出力
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ CSV出力
const downloadCSV = async (period: string) => {
  try {
    const res = await axios.get(`${API_BASE}/reports/sales-list/${period}`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${period}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("CSV出力に失敗しました");
    console.error(err);
  }
};

// ✅ PDF出力
const downloadPDF = async (period: string) => {
  try {
    const res = await axios.get(`${API_BASE}/reports/sales-summary/${period}`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-${period}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("PDF出力に失敗しました");
    console.error(err);
  }
};
</script>

<style scoped>
button:hover {
  opacity: 0.85;
}
</style>
