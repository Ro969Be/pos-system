<template>
  <section class="calendar">
    <header class="head">
      <h2>予約カレンダー</h2>
      <div class="filters">
        <label>
          <span>開始日</span>
          <input type="date" v-model="from" @change="load" />
        </label>
        <label>
          <span>終了日</span>
          <input type="date" v-model="to" @change="load" />
        </label>
      </div>
    </header>
    <div v-if="error" class="err">{{ error }}</div>

    <div class="grid">
      <div v-for="slot in slots" :key="slot._id" class="card">
        <p class="date">
          {{ formatDate(slot.date) }} {{ slot.time }}
        </p>
        <p class="flag" :class="flagClass(slot.openFlag)">
          {{ slot.openFlag === "休" ? "休" : slot.openFlag }}
        </p>
        <p class="cap">残席: {{ slot.capacityRemains ?? "-" }}</p>
        <p class="notes" v-if="slot.notes">{{ slot.notes }}</p>
      </div>
      <div v-if="!slots.length" class="muted">スロットがありません</div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const slots = ref([]);
const error = ref("");
const from = ref(new Date().toISOString().slice(0, 10));
const to = ref(
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
);

async function load() {
  error.value = "";
  try {
    const { data } = await api.get(`/shops/${shopId}/slots`, {
      params: { from: from.value, to: to.value },
    });
    slots.value = data || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "スロット取得に失敗しました";
  }
}

function formatDate(val) {
  return new Date(val).toLocaleDateString();
}

function flagClass(flag) {
  if (flag === "休" || flag === "close") return "closed";
  if (flag === "hold") return "hold";
  return "open";
}

onMounted(load);
</script>

<style scoped>
.calendar {
  padding: 16px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.filters {
  display: flex;
  gap: 12px;
}
.filters label {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.card {
  background: #0f1522;
  border: 1px solid #1f2636;
  border-radius: 10px;
  padding: 12px;
}
.date {
  font-weight: 600;
}
.flag {
  font-size: 1.2rem;
  margin: 6px 0;
}
.flag.open {
  color: #4ade80;
}
.flag.hold {
  color: #facc15;
}
.flag.closed {
  color: #f87171;
}
.cap {
  font-size: 0.9rem;
}
.err {
  color: #f87171;
  margin-bottom: 10px;
}
.muted {
  grid-column: 1 / -1;
  text-align: center;
  color: #7b869f;
}
</style>
