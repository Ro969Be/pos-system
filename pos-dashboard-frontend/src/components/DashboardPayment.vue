<template>
  <div class="payment-card">
    <h2>💰 支払い構成</h2>
    <canvas ref="paymentChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";

const paymentChart = ref(null);
let chartInstance = null;

const payments = ref([
  { type: "現金", value: 18770 },
  { type: "PayPay", value: 18560 },
  { type: "カード", value: 7070 },
]);

function renderChart() {
  const ctx = paymentChart.value.getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: payments.value.map(p => p.type),
      datasets: [
        {
          data: payments.value.map(p => p.value),
          backgroundColor: ["#f4c95d", "#4b9ce2", "#67c587"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

onMounted(renderChart);
</script>

<style scoped>
.payment-card {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
