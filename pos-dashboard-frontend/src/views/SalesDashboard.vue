<!-- ==========================================================
SalesDashboard.vue
--------------------------------------------------------------
売上ダッシュボード
- 今日の売上合計
- 日/週/月/年単位のグラフ
- 商品別売上ランキング
----------------------------------------------------------- -->
<template>
  <div class="sales-dashboard">
    <h2>売上ダッシュボード</h2>

    <section class="today">
      <h3>今日の売上</h3>
      <p>日付：{{ today.date }}</p>
      <p>件数：{{ today.count }}</p>
      <h1>¥{{ today.total.toLocaleString() }}</h1>
    </section>

    <section class="chart">
      <h3>期間別売上推移（{{ periodLabel }}）</h3>
      <select v-model="period" @change="loadPeriodSales">
        <option value="day">日次</option>
        <option value="week">週次</option>
        <option value="month">月次</option>
        <option value="year">年次</option>
      </select>
      <canvas id="salesChart"></canvas>
    </section>

    <section class="table">
      <h3>商品別売上</h3>
      <table>
        <thead>
          <tr>
            <th>商品名</th>
            <th>カテゴリー</th>
            <th>販売数</th>
            <th>売上金額</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p._id">
            <td>{{ p._id }}</td>
            <td>{{ p.category }}</td>
            <td>{{ p.count }}</td>
            <td>¥{{ p.totalSales.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import axios from "axios";
import Chart from "chart.js/auto";

export default {
  name: "SalesDashboard",
  data() {
    return {
      today: { total: 0, count: 0, date: "" },
      period: "month",
      products: [],
      chart: null,
    };
  },
  computed: {
    periodLabel() {
      return { day: "日次", week: "週次", month: "月次", year: "年次" }[this.period];
    },
  },
  async mounted() {
    await this.loadToday();
    await this.loadPeriodSales();
    await this.loadProductSales();
  },
  methods: {
    async loadToday() {
      const { data } = await axios.get("/api/sales/today");
      this.today = data;
    },
    async loadPeriodSales() {
      const { data } = await axios.get("/api/sales/period", { params: { period: this.period } });
      const labels = data.map((d) => `${d._id.month}/${d._id.day}`);
      const totals = data.map((d) => d.total);
      this.renderChart(labels, totals);
    },
    async loadProductSales() {
      const { data } = await axios.get("/api/sales/product", { params: { period: this.period } });
      this.products = data;
    },
    renderChart(labels, totals) {
      if (this.chart) this.chart.destroy();
      const ctx = document.getElementById("salesChart");
      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "売上金額",
              data: totals,
              fill: false,
              borderColor: "#007bff",
              tension: 0.1,
            },
          ],
        },
      });
    },
  },
};
</script>

<style scoped>
.sales-dashboard {
  padding: 20px;
}
.today {
  background: #f0f8ff;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}
.today h1 {
  font-size: 2rem;
  color: #007bff;
}
.chart {
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
th {
  background: #f7f7f7;
}
</style>
