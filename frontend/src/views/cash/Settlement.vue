<template>
  <section class="page">
    <header class="head">
      <h2>レジ精算</h2>
      <button class="btn ghost" @click="load">更新</button>
    </header>
    <div v-if="error" class="err">{{ error }}</div>
    <div class="grid">
      <article v-for="session in sessions" :key="session._id" class="card">
        <h3>{{ session.registerName }}</h3>
        <p>開始: ¥{{ session.openingAmount }}</p>
        <p>予想: ¥{{ session.expectedCash }}</p>
        <form @submit.prevent="closeSession(session)">
          <label class="field">
            <span>実測金額</span>
            <input
              type="number"
              min="0"
              v-model.number="closingInputs[session._id]"
              required
            />
          </label>
          <label class="field">
            <span>メモ</span>
            <textarea v-model="notes[session._id]" rows="2"></textarea>
          </label>
          <button class="btn" type="submit" :disabled="loading">
            {{ loading ? "処理中..." : "精算する" }}
          </button>
        </form>
        <p v-if="session.diffAmount != null">
          差額: <strong :class="{ warn: session.diffAmount !== 0 }">¥{{ session.diffAmount }}</strong>
        </p>
        <button
          v-if="session.approvals?.required && !session.approvals?.approved"
          class="btn ghost"
          @click="approve(session)"
        >
          差額承認
        </button>
      </article>
      <p v-if="!sessions.length" class="muted">開局中のレジはありません</p>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const sessions = ref([]);
const closingInputs = reactive({});
const notes = reactive({});
const error = ref("");
const loading = ref(false);

async function load() {
  error.value = "";
  const { data: registers } = await api.get(`/shops/${shopId}/registers`);
  const result = [];
  for (const reg of registers || []) {
    const res = await api.get(
      `/shops/${shopId}/registers/${reg._id}/history`,
      { params: { status: "open" } }
    );
    const session = res.data?.[0];
    if (session) {
      session.registerName = reg.name;
      result.push(session);
      closingInputs[session._id] = closingInputs[session._id] ?? session.expectedCash;
      notes[session._id] = notes[session._id] || "";
    }
  }
  sessions.value = result;
}

async function closeSession(session) {
  loading.value = true;
  try {
    const { data } = await api.patch(
      `/shops/${shopId}/registers/${session.registerId}/session/${session._id}/close`,
      { closingAmount: closingInputs[session._id], notes: notes[session._id] }
    );
    session.diffAmount = data.diffAmount;
    session.approvals = data.approvals;
  } catch (e) {
    error.value = e?.response?.data?.message || "精算に失敗しました";
  } finally {
    loading.value = false;
    await load();
  }
}

async function approve(session) {
  await api.patch(
    `/shops/${shopId}/registers/${session.registerId}/session/${session._id}/approve`
  );
  await load();
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }
.card { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:14px; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.btn { background:#3b82f6; border:none; border-radius:6px; padding:6px 12px; color:#fff; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.warn { color:#f87171; }
.muted { grid-column:1 / -1; text-align:center; color:#7b869f; }
.err { color:#f87171; margin-bottom:8px; }
input, textarea{ background:#0b1220; border:1px solid #28324a; border-radius:8px; color:#d5dbea; padding:8px; }
</style>
