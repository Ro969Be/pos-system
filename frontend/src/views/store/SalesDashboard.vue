<template>
  <section class="page sals">
    <div class="sals-header">
      <h2>売上ダッシュボード</h2>
      <div class="tabs">
        <button class="tab" :class="{active: tab==='daily'}" @click="tab='daily'">日次</button>
        <button class="tab" :class="{active: tab==='monthly'}" @click="tab='monthly'">月次</button>
      </div>
    </div>

    <div class="kpis">
      <div class="kpi">
        <div class="kpi-label">本日売上（デモ）</div>
        <div class="kpi-value">¥{{ todayAmount.toLocaleString() }}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">平均単価（仮）</div>
        <div class="kpi-value">¥{{ avgUnit.toLocaleString() }}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">点数（仮）</div>
        <div class="kpi-value">{{ totalQty.toLocaleString() }}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card chart">
        <h3>{{ tab==='daily' ? '日次売上' : '月次売上' }}</h3>
        <svg :viewBox="`0 0 ${vw} ${vh}`" class="chart-svg">
          <!-- 軸 -->
          <line :x1="pad" :y1="pad" :x2="pad" :y2="vh-pad" class="axis"/>
          <line :x1="pad" :y1="vh-pad" :x2="vw-pad" :y2="vh-pad" class="axis"/>

          <!-- 棒グラフ -->
          <g v-for="(p,i) in points" :key="i">
            <rect
              :x="pad + i*barW + barGap"
              :y="mapY(p.y)"
              :width="barW - barGap*2"
              :height="(vh-pad) - mapY(p.y)"
              class="bar"
            />
            <text :x="pad + i*barW + barW/2" :y="vh-pad + 14" class="tick" text-anchor="middle">
              {{ p.x }}
            </text>
          </g>
        </svg>
      </div>

      <div class="card rank">
        <h3>商品ランキング（売上）</h3>
        <div class="rank-list">
          <div v-for="(r,i) in ranking" :key="i" class="rank-item">
            <div class="r-left">
              <div class="r-no">{{ i+1 }}</div>
              <div class="r-name">{{ r.name }}</div>
            </div>
            <div class="r-right">
              <div class="r-amt">¥{{ r.amount.toLocaleString() }}</div>
              <div class="r-qty">{{ r.qty }}点</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import * as ds from "@/lib/dummy/sales";

const tab = ref("daily");

// KPIs（デモ計算）
const todayAmount = computed(() => (ds.daily[ds.daily.length-1]?.amount ?? 0));
const avgUnit = computed(() => Math.round((todayAmount.value / 120) || 0));
const totalQty = computed(() => 120);

// グラフ用データ点
const points = computed(() => {
  return tab.value === "daily"
    ? ds.daily.map(d => ({ x: d.date, y: d.amount }))
    : ds.monthly.map(d => ({ x: d.month.slice(5), y: d.amount })); // "YYYY/MM" → "MM"
});

// SVGスケール
const vw = 560, vh = 260, pad = 30;
const barW = computed(() => (vw - pad*2) / Math.max(points.value.length,1));
const barGap = 6;
const yMax = computed(() => {
  const m = Math.max(...points.value.map(p=>p.y), 1);
  // 目盛り見やすく天井を丸める
  const unit = 50000;
  return Math.ceil(m / unit) * unit;
});
const mapY = (val) => {
  const top = pad, bottom = vh - pad;
  const ratio = Math.min(1, val / yMax.value);
  return bottom - (bottom - top) * ratio;
};

// ランキングはそのまま
const ranking = ds.ranking;
</script>

<style src="../../styles/pages/SalesDashboard.css"></style>
