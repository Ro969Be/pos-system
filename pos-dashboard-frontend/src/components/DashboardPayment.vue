<!-- ==========================================================
DashboardPayment.vue
--------------------------------------------------------------
・支払い方法別売上構成（円グラフ）
・割合（%）と金額のリスト表示
=========================================================== -->
<template>
  <div class="dashboard-payment">
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
    </div>

    <v-chart :option="chartOption" autoresize style="height: 380px" />

    <ul class="legend" v-if="rows.length">
      <li v-for="r in rows" :key="r.name">
        <span class="name">{{ r.name }}</span>
        <span class="value">¥{{ r.value.toLocaleString() }}</span>
        <span class="ratio">{{ ratioOf(r.value) }}%</span>
      </li>
    </ul>
  </div>
</template>

<script>
/* eslint-disable */
import axios from "axios";
import { use } from "echarts/core";
import VChart from "vue-echarts";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export default {
  name: "DashboardPayment",
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
    total() {
      return this.rows.reduce((s, x) => s + (x.value || 0), 0);
    },
    chartOption() {
      return {
        title: { text: `${this.year}年${this.month}月 支払い構成`, left: "center" },
        tooltip: { trigger: "item", formatter: "{b}<br/>¥{c} ({d}%)" },
        legend: { bottom: 0 },
        series: [
          {
            name: "決済",
            type: "pie",
            radius: "60%",
            data: this.rows.map((r) => ({ name: r.name, value: r.value })),
            emphasis: { itemStyle: { shadowBlur: 8, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.3)" } },
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
      const { data } = await axios.get("/api/sales-dashboard/payment", {
        params: { year: this.year, month: this.month, storeId: this.storeId || undefined },
      });
      this.rows = data || [];
    },
    ratioOf(v) {
      if (!this.total) return 0;
      return Math.round((v / this.total) * 1000) / 10; // 小数1桁
    },
  },
  async mounted() {
    await this.loadStores();
    await this.loadData();
  },
};
</script>

<style scoped>
.dashboard-payment { padding: 8px; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
.filters label { font-weight: 600; }
.legend { list-style: none; padding: 0; margin-top: 12px; }
.legend li {
  display: grid; grid-template-columns: 1fr auto auto; gap: 8px;
  padding: 6px 0; border-bottom: 1px dashed #ddd;
}
.legend .name { font-weight: 600; }
.legend .value, .legend .ratio { text-align: right; }
.muted { color: #888; }
</style>
