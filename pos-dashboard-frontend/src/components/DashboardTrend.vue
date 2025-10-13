<!-- ==========================================================
DashboardTrend.vue
--------------------------------------------------------------
・期間切替: 日/週/月
・棒(売上) + 折れ線(会計数)
・テーブル明細
・日別の行からモーダルで伝票詳細
・CSV/PDFボタン（/api/sales-trend を流用）
=========================================================== -->
<template>
  <div class="dashboard-trend">
    <div class="filters">
      <label>店舗:</label>
      <select v-model="storeId" v-if="stores.length">
        <option v-for="s in stores" :key="s._id" :value="s._id">{{ s.name }}</option>
      </select>
      <span v-else class="muted">店舗データ未取得</span>

      <label>期間:</label>
      <select v-model="period">
        <option value="daily">日別</option>
        <option value="weekly">週別</option>
        <option value="monthly">月別</option>
      </select>

      <label>年:</label>
      <select v-model="year">
        <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
      </select>

      <label v-if="period==='daily'">月:</label>
      <select v-if="period==='daily'" v-model="month">
        <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
      </select>

      <button @click="loadData">表示</button>

      <!-- CSV / PDF は日別（年月指定）に対して有効 -->
      <a
        class="btn csv"
        :href="`/api/sales-trend/csv?year=${year}&month=${month}&storeId=${storeId}`"
        target="_blank"
        :class="{ disabled: period!=='daily' }"
        @click.prevent="period!=='daily' ? null : undefined"
      >📥 CSV</a>

      <a
        class="btn pdf"
        :href="`/api/sales-trend/pdf?year=${year}&month=${month}&storeId=${storeId}`"
        target="_blank"
        :class="{ disabled: period!=='daily' }"
        @click.prevent="period!=='daily' ? null : undefined"
      >🧾 PDF</a>
    </div>

    <v-chart :option="chartOption" autoresize style="height: 420px" />

    <div v-if="rows.length" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ラベル</th>
            <th>売上</th>
            <th>会計数</th>
            <th>平均単価</th>
            <th v-if="period==='daily'">詳細</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.label">
            <td>{{ labelText(r.label) }}</td>
            <td>¥{{ r.totalSales.toLocaleString() }}</td>
            <td>{{ r.orderCount }}</td>
            <td>¥{{ r.avg.toLocaleString() }}</td>
            <td v-if="period==='daily'">
              <button class="link" @click="openDetail(r.label)">🔍</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <OrderDetailModal
      v-if="showModal"
      :orders="detailOrders"
      @close="showModal=false"
    />
  </div>
</template>

<script>
/* eslint-disable */
// Composition API でなく Options API で記述（既存プロジェクトに合わせやすい）
import axios from "axios";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { BarChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import OrderDetailModal from "./OrderDetailModal.vue";

use([BarChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

export default {
  name: "DashboardTrend",
  components: { VChart, OrderDetailModal },
  data() {
    const now = new Date();
    return {
      period: "daily", // daily / weekly / monthly
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      years: Array.from({ length: 6 }, (_, i) => now.getFullYear() - i),
      stores: [],
      storeId: "",
      rows: [], // API結果
      showModal: false,
      detailOrders: [],
    };
  },
  computed: {
    chartOption() {
      return {
        title: { text: this.chartTitle(), left: "center" },
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const s = params.find((p) => p.seriesName === "売上");
            const o = params.find((p) => p.seriesName === "会計数");
            const label = this.labelText(s.axisValue);
            return `${label}<br/>売上: ¥${(s?.value ?? 0).toLocaleString()}<br/>会計数: ${(o?.value ?? 0)}`;
          },
        },
        legend: { bottom: 0 },
        xAxis: { type: "category", data: this.rows.map((r) => r.label) },
        yAxis: [
          { type: "value", name: "売上(円)" },
          { type: "value", name: "会計数", position: "right" },
        ],
        series: [
          {
            name: "売上",
            type: "bar",
            data: this.rows.map((r) => r.totalSales),
            itemStyle: { color: "#1e88e5" },
          },
          {
            name: "会計数",
            type: "line",
            yAxisIndex: 1,
            data: this.rows.map((r) => r.orderCount),
            itemStyle: { color: "#ffb300" },
            smooth: true,
          },
        ],
      };
    },
  },
  methods: {
    chartTitle() {
      if (this.period === "daily") return `${this.year}年${this.month}月 売上推移`;
      if (this.period === "weekly") return `${this.year}年 週別売上推移`;
      return `${this.year}年 月別売上推移`;
    },
    labelText(label) {
      // daily: 日、weekly: 週、monthly: 月
      if (this.period === "daily") return `${label}日`;
      if (this.period === "weekly") return `${label}週`;
      return `${label}月`;
    },
    async loadStores() {
      try {
        const { data } = await axios.get("/api/stores");
        this.stores = data || [];
        if (!this.storeId && this.stores.length) this.storeId = this.stores[0]._id;
      } catch (e) {
        // 店舗APIが未実装でも動作継続
        this.stores = [];
        this.storeId = "";
      }
    },
    async loadData() {
      const { data } = await axios.get("/api/sales-dashboard/trend", {
        params: {
          period: this.period,
          year: this.year,
          month: this.month,
          storeId: this.storeId || undefined,
        },
      });
      this.rows = data || [];
    },
    async openDetail(dayLabel) {
      // 日別のみ詳細対応：YYYY-MM-DD を作る
      if (this.period !== "daily") return;
      const y = this.year;
      const m = String(this.month).padStart(2, "0");
      const d = String(dayLabel).padStart(2, "0");
      const iso = `${y}-${m}-${d}`;
      const { data } = await axios.get(`/api/sales-dashboard/detail/${iso}/${this.storeId || ""}`);
      this.detailOrders = data;
      this.showModal = true;
    },
  },
  async mounted() {
    await this.loadStores();
    await this.loadData();
  },
};
</script>

<style scoped>
.dashboard-trend { padding: 8px; }
.filters {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px;
}
.filters label { font-weight: 600; }
.btn { padding: 6px 10px; border-radius: 6px; text-decoration: none; color: #fff; margin-left: 4px; }
.btn.csv { background: #43a047; }
.btn.pdf { background: #7b1fa2; }
.btn.disabled { background: #bbb !important; pointer-events: none; }
.table-wrap { margin-top: 16px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 6px; text-align: right; }
th { background: #f7f7f7; }
th:first-child, td:first-child { text-align: center; }
button.link { background: transparent; border: none; color: #1e88e5; cursor: pointer; }
.muted { color: #888; }
</style>
