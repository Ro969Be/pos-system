<template>
  <div class="dashboard">
    <h2>📊 売上ダッシュボード</h2>

    <div class="tab-buttons">
      <button v-for="t in tabs" :key="t.value" :class="{active:tab===t.value}" @click="tab=t.value">
        {{ t.label }}
      </button>
    </div>

    <DashboardTrend v-if="tab==='trend'" />
    <DashboardCategory v-else-if="tab==='category'" />
    <DashboardPayment v-else-if="tab==='payment'" />
  </div>
</template>

<script>
import DashboardTrend from "../components/DashboardTrend.vue";
import DashboardCategory from "../components/DashboardCategory.vue";
import DashboardPayment from "../components/DashboardPayment.vue";

export default {
  components: { DashboardTrend, DashboardCategory, DashboardPayment },
  data() {
    return {
      tab: "trend",
      tabs: [
        { value: "trend", label: "📈 日/週/月別" },
        { value: "category", label: "🍽 カテゴリー別" },
        { value: "payment", label: "💳 支払い構成" },
      ],
    };
  },
};
</script>

<style scoped>
.tab-buttons { display:flex; gap:8px; margin-bottom:12px; }
button { padding:6px 12px; border:1px solid #ccc; cursor:pointer; border-radius:6px; }
button.active { background:#007bff; color:white; border-color:#007bff; }
</style>
