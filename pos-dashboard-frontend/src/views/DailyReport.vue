<!-- 当日日報：表示＆CSV/PDF -->
<template>
  <div class="report">
    <h2>日報</h2>
    <label>日付</label>
    <input type="date" v-model="date" />
    <div class="actions">
      <a :href="`/api/reports/daily.csv?date=${date}`" target="_blank">CSV ダウンロード</a>
      <a :href="`/api/reports/daily.pdf?date=${date}`" target="_blank">PDF ダウンロード</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "DailyReport",
  data() {
    const today = new Date().toISOString().slice(0,10);
    return { date: today };
  },
};
</script>

<style scoped>
.report { padding: 20px; }
.actions a { margin-right: 12px; }
</style>
