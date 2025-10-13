<template>
  <div class="dashboard">
    <DashboardTrend />
    <DashboardCategory />
    <DashboardPayment />
  </div>
</template>

<script setup>
import DashboardTrend from "../components/DashboardTrend.vue";
import DashboardCategory from "../components/DashboardCategory.vue";
import DashboardPayment from "../components/DashboardPayment.vue";
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}
</style>
