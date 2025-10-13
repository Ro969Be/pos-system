<template>
  <div class="category-card">
    <h2>📦 カテゴリー別売上</h2>
    <button @click="exportCSV">CSV出力</button>

    <canvas ref="categoryChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";

const categoryChart = ref(null);
let chartInstance = null;

const categories = ref([
  { name: "ドリンク", value: 120000 },
  { name: "フード", value: 200000 },
  { name: "デザート", value: 80000 },
]);

function renderChart() {
  const ctx = categoryChart.value.getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: categories.value.map(c => c.name),
      datasets: [
        {
          label: "売上額",
          data: categories.value.map(c => c.value),
          backgroundColor: ["#4b9ce2", "#67c587", "#f4c95d"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
    },
  });
}

function exportCSV() {
  const header = "カテゴリー,売上額\n";
  const rows = categories.value.map(c => `${c.name},${c.value}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "category_sales.csv";
  a.click();
}

onMounted(renderChart);
</script>

<style scoped>
.category-card {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
button {
  margin-bottom: 10px;
  padding: 6px 12px;
  background: #4b9ce2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
