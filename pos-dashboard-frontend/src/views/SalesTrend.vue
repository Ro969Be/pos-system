<template>
  <div class="sales-trend">
    <h2>📈 日別売上レポート</h2>

    <div class="filters">
      <label>店舗:</label>
      <select v-model="storeId">
        <option v-for="s in stores" :key="s._id" :value="s._id">{{ s.name }}</option>
      </select>

      <label>年:</label>
      <select v-model="year">
        <option v-for="y in years" :key="y">{{ y }}</option>
      </select>

      <label>月:</label>
      <select v-model="month">
        <option v-for="m in 12" :key="m">{{ m }}</option>
      </select>

      <button @click="loadData">表示</button>
      <a :href="`/api/sales-trend/csv?year=${year}&month=${month}&storeId=${storeId}`" target="_blank">📥 CSV</a>
      <a :href="`/api/sales-trend/pdf?year=${year}&month=${month}&storeId=${storeId}`" target="_blank">🧾 PDF</a>
    </div>

    <v-chart :option="chartOption" autoresize style="height:400px" />

    <table v-if="data.length">
      <thead>
        <tr>
          <th>日付</th><th>売上</th><th>会計数</th><th>平均単価</th><th>詳細</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in data" :key="r.date">
          <td>{{ r.date }}</td>
          <td>¥{{ r.totalSales.toLocaleString() }}</td>
          <td>{{ r.orderCount }}</td>
          <td>¥{{ r.avg.toLocaleString() }}</td>
          <td><button @click="openDetail(r.date)">🔍</button></td>
        </tr>
      </tbody>
    </table>

    <OrderDetailModal v-if="showModal" :orders="detailOrders" @close="showModal=false" />
  </div>
</template>

<script>
import axios from "axios";
import VChart from "vue-echarts";
import OrderDetailModal from "../components/OrderDetailModal.vue";
import { use } from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([BarChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

export default {
  name: "SalesTrend",
  components: { VChart, OrderDetailModal },
  data() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      years: Array.from({ length: 5 }, (_, i) => now.getFullYear() - i),
      data: [],
      stores: [],
      storeId: "",
      showModal: false,
      detailOrders: [],
    };
  },
  computed: {
    chartOption() {
      return {
        title: { text: `${this.year}年${this.month}月 売上推移`, left: "center" },
        tooltip: { trigger: "axis" },
        legend: { bottom: 0 },
        xAxis: { type: "category", data: this.data.map((r) => r.date.split("/")[2]) },
        yAxis: [
          { type: "value", name: "売上(円)" },
          { type: "value", name: "会計数", position: "right" },
        ],
        series: [
          {
            name: "売上",
            type: "bar",
            data: this.data.map((r) => r.totalSales),
            itemStyle: { color: "#2196f3" },
          },
          {
            name: "会計数",
            type: "line",
            yAxisIndex: 1,
            data: this.data.map((r) => r.orderCount),
            itemStyle: { color: "#ff9800" },
          },
        ],
      };
    },
  },
  methods: {
    async loadData() {
      const { data } = await axios.get("/api/sales-trend", {
        params: { year: this.year, month: this.month, storeId: this.storeId },
      });
      this.data = data.data;
    },
    async openDetail(date) {
      const { data } = await axios.get(`/api/sales-trend/detail/${date}/${this.storeId}`);
      this.detailOrders = data;
      this.showModal = true;
    },
  },
  async mounted() {
    const storeRes = await axios.get("/api/stores");
    this.stores = storeRes.data;
    if (this.stores.length) this.storeId = this.stores[0]._id;
    this.loadData();
  },
};
</script>
