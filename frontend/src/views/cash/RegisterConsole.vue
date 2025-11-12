<template>
  <section class="page">
    <header class="head">
      <h2>レジ管理</h2>
      <button class="btn ghost" @click="load">更新</button>
    </header>
    <div v-if="error" class="err">{{ error }}</div>
    <div class="grid">
      <article v-for="reg in registers" :key="reg._id" class="card">
        <header>
          <h3>{{ reg.name }}</h3>
          <p>ID: {{ reg._id }}</p>
        </header>

        <section v-if="sessions[reg._id]" class="section">
          <p>開局者: {{ sessions[reg._id].openedBy || "-" }}</p>
          <p>開始金額: ¥{{ sessions[reg._id].openingAmount }}</p>
          <p>予想金額: ¥{{ sessions[reg._id].expectedCash }}</p>
          <form class="cash-form" @submit.prevent="moveCash(reg, sessions[reg._id], 'cashIn')">
            <label>
              <span>入金</span>
              <input type="number" min="1" v-model.number="cashInputs[reg._id].cashIn" />
            </label>
            <button class="btn" type="submit">入金</button>
          </form>
          <form class="cash-form" @submit.prevent="moveCash(reg, sessions[reg._id], 'cashOut')">
            <label>
              <span>出金</span>
              <input type="number" min="1" v-model.number="cashInputs[reg._id].cashOut" />
            </label>
            <button class="btn ghost" type="submit">出金</button>
          </form>
        </section>

        <section v-else class="section">
          <form @submit.prevent="openSession(reg)">
            <label class="field">
              <span>開局金額</span>
              <input
                type="number"
                min="0"
                v-model.number="openInputs[reg._id]"
                required
              />
            </label>
            <button class="btn" type="submit" :disabled="loading">
              {{ loading ? "処理中..." : "開局" }}
            </button>
          </form>
        </section>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const registers = ref([]);
const sessions = reactive({});
const openInputs = reactive({});
const cashInputs = reactive({});
const loading = ref(false);
const error = ref("");

async function load() {
  error.value = "";
  const { data } = await api.get(`/shops/${shopId}/registers`);
  registers.value = data || [];
  await Promise.all(
    registers.value.map(async (reg) => {
      const sessionRes = await api.get(
        `/shops/${shopId}/registers/${reg._id}/session`
      );
      sessions[reg._id] = sessionRes.data || null;
      openInputs[reg._id] = openInputs[reg._id] ?? 0;
      cashInputs[reg._id] = cashInputs[reg._id] || { cashIn: 0, cashOut: 0 };
    })
  );
}

async function openSession(register) {
  loading.value = true;
  try {
    await api.post(
      `/shops/${shopId}/registers/${register._id}/session`,
      { openingAmount: openInputs[register._id] }
    );
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "開局に失敗しました";
  } finally {
    loading.value = false;
  }
}

async function moveCash(register, session, type) {
  const amount = cashInputs[register._id][type];
  if (!amount || amount <= 0) return;
  try {
    await api.post(
      `/shops/${shopId}/registers/${register._id}/session/${session._id}/cash`,
      { type, amount }
    );
    cashInputs[register._id][type] = 0;
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "現金操作に失敗しました";
  }
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }
.card { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:14px; }
.section { margin-top:12px; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.btn { background:#3b82f6; border:none; border-radius:6px; padding:6px 10px; color:#fff; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.cash-form { display:flex; gap:8px; align-items:flex-end; margin-top:8px; }
.cash-form input { width:100px; background:#0b1220; border:1px solid #28324a; border-radius:6px; color:#d5dbea; padding:6px; }
.err { color:#f87171; margin-bottom:8px; }
</style>
