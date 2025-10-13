<!-- ==========================================================
DashboardCategory.vue
--------------------------------------------------------------
・月単位でカテゴリー別売上を集計表示
・棒グラフ + テーブル
・CSV出力はフロント側で生成（UTF-8+BOM）
=========================================================== -->
<template>
  <div class="dashboard-category">
    <div class="filters">
      <label>店舗:</label>
      <select v-model="storeId" v-if="stores.length">
        <option v-for="s in stores" :key="s._id" :value="s._id">{{ s.name }}</option>
      </select>
      <span v-else class="muted">店舗データ未取得</span>

      <label>年:</label>
      <select v-model="year">
        <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
      </select>

      <label>月:</label>
      <select v-model="month">
        <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
      </select>

      <button @click="loadData">集計</button>
      <button class="btn csv" @click="exportCsv" :disabled="!rows.length">📥 CSV</button>
    </div>

    <v-chart :option="chartOption" autoresize style="height: 400px" />

    <div v-if="rows.length" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>カテゴリー</th>
            <th>売上</th>
            <th>販売数量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.category">
            <td>{{ r.category }}</td>
            <td>¥{{ r.totalSales.toLocaleString() }}</td>
            <td>{{ r.qty }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import axios from "axios";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { BarChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

export default {
  name: "DashboardCategory",
  components: { VChart },
  data() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      years: Array.from({ length: 6 }, (_, i) => now.getFullYear() - i),
      stores: [],
      storeId: "",
      rows: [],
    };
  },
  computed: {
    chartOption() {
      return {
        title: { text: `${this.year}年${this.month}月 カテゴリー別売上`, left: "center" },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: this.rows.map((r) => r.category) },
        yAxis: { type: "value", name: "売上(円)" },
        series: [
          {
            name: "売上",
            type: "bar",
            data: this.rows.map((r) => r.totalSales),
            itemStyle: { color: "#3949ab" },
          },
        ],
      };
    },
  },
  methods: {
    async loadStores() {
      try {
        const { data } = await axios.get("/api/stores");
        this.stores = data || [];
        if (!this.storeId && this.stores.length) this.storeId = this.stores[0]._id;
      } catch (e) {
        this.stores = [];
        this.storeId = "";
      }
    },
    async loadData() {
      const { data } = await axios.get("/api/sales-dashboard/category", {
        params: { year: this.year, month: this.month, storeId: this.storeId || undefined },
      });
      this.rows = data || [];
    },
    // ===== フロントでCSV生成（UTF-8 + BOM） =====
    exportCsv() {
      if (!this.rows.length) return;
      const header = ["カテゴリー", "売上", "販売数量"];
      const body = this.rows.map((r) => [
        `"${r.category}"`,
        r.totalSales,
        r.qty,
      ]);
      const csv = [header, ...body].map((row) => row.join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `category-${this.year}-${this.month}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  },
  async mounted() {
    await this.loadStores();
    await this.loadData();
  },
};
</script>

<style scoped>
.dashboard-category { padding: 8px; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
.filters label { font-weight: 600; }
.table-wrap { margin-top: 16px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 6px; text-align: right; }
th { background: #f7f7f7; }
th:first-child, td:first-child { text-align: left; }
.btn.csv { padding: 6px 10px; border-radius: 6px; background: #43a047; color: #fff; }
.muted { color: #888; }
</style>
