<template>
  <div class="category-sales">
    <h3>🍽 カテゴリー別売上</h3>

    <div class="filters">
      <label>年:</label>
      <select v-model="year">
        <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
      </select>
      <button @click="loadData">集計する</button>
    </div>

    <v-chart :option="chartOption" autoresize style="height:400px" />

    <table v-if="tableData.length">
      <thead>
        <tr>
          <th>カテゴリー</th>
          <th>売上</th>
          <th>会計数</th>
          <th>平均単価</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in tableData" :key="r.category">
          <td>{{ r.category }}</td>
          <td>¥{{ r.totalSales.toLocaleString() }}</td>
          <td>{{ r.orderCount }}</td>
          <td>¥{{ Math.round(r.totalSales / (r.orderCount||1)).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

export default {
  name: "SalesByCategory",
  components: { VChart },
  data() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      years: Array.from({ length: 5 }, (_, i) => now.getFullYear() - i),
      chartData: [],
      tableData: [],
    };
  },
  computed: {
    chartOption() {
      return {
        title: { text: `${this.year}年 カテゴリー別売上`, left: "center" },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: this.chartData.map((c) => c.category) },
        yAxis: { type: "value", name: "売上(円)" },
        series: [
          {
            name: "売上",
            type: "bar",
            data: this.chartData.map((c) => c.totalSales),
            itemStyle: { color: "#3f51b5" },
          },
        ],
      };
    },
  },
  methods: {
    async loadData() {
      const { data } = await axios.get("/api/sales-category", { params: { year: this.year } });
      this.chartData = data.categories;
      this.tableData = data.categories;
    },
  },
  mounted() {
    this.loadData();
  },
};
</script>

<style scoped>
.category-sales {
  padding: 10px;
}
.filters {
  display: flex;
  align-items: center;
  gap: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
th, td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: right;
}
th:first-child, td:first-child {
  text-align: left;
}
</style>
