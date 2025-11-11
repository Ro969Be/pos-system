<template>
  <section class="page">
    <header class="head">
      <h2>予約一覧</h2>
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
      <router-link
        class="btn"
        :to="`/admin/shops/${shopId}/reservations/new`"
      >
        予約を作成
      </router-link>
    </header>

    <div v-if="error" class="err">{{ error }}</div>

    <table class="list">
      <thead>
        <tr>
          <th>顧客</th>
          <th>日時</th>
          <th>人数</th>
          <th>ステータス</th>
          <th>席</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in reservations" :key="r._id">
          <td>{{ r.customerName }}</td>
          <td>
            {{ formatTime(r.startTime) }} -
            {{ new Date(r.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }}
          </td>
          <td>{{ r.partySize?.total }}</td>
          <td>{{ r.status }}</td>
          <td>{{ r.tableId ?? "-" }}</td>
        </tr>
        <tr v-if="!reservations.length">
          <td colspan="5" class="muted">予約はありません</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const reservations = ref([]);
const error = ref("");
const from = ref(new Date().toISOString().slice(0, 10));
const to = ref(
  new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
);

async function load() {
  error.value = "";
  try {
    const { data } = await api.get(`/shops/${shopId}/reservations`, {
      params: { from: from.value, to: to.value },
    });
    reservations.value = data || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "予約の取得に失敗しました";
  }
}

function formatTime(val) {
  return new Date(val).toLocaleString();
}

onMounted(load);
</script>

<style scoped>
.page {
  padding: 16px;
}
.head {
  display: flex;
  align-items: center;
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
.list {
  width: 100%;
  border-collapse: collapse;
  background: #0f1522;
  border: 1px solid #1f2636;
}
.list th,
.list td {
  padding: 8px;
  border-bottom: 1px solid #1f2636;
}
.btn {
  background: #3b82f6;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  text-decoration: none;
}
.err {
  color: #f87171;
  margin-bottom: 8px;
}
.muted {
  color: #7b869f;
  text-align: center;
  padding: 12px 0;
}
</style>
