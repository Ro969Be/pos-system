<template>
  <section class="page">
    <header class="head">
      <h2>FLR 管理</h2>
      <button class="btn" @click="toggleForm">{{ showForm ? "閉じる" : "追加" }}</button>
    </header>
    <div v-if="error" class="err">{{ error }}</div>
    <form v-if="showForm" class="panel" @submit.prevent="save">
      <label class="field">
        <span>日付</span>
        <input type="date" v-model="form.date" required />
      </label>
      <label class="field">
        <span>金額</span>
        <input type="number" v-model.number="form.amount" required />
      </label>
      <label class="field">
        <span>内容</span>
        <textarea v-model="form.description"></textarea>
      </label>
      <div class="ops">
        <button class="btn ghost" type="button" @click="toggleForm">キャンセル</button>
        <button class="btn" type="submit">保存</button>
      </div>
    </form>

    <table class="list">
      <thead>
        <tr>
          <th>日付</th>
          <th>金額</th>
          <th>内容</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row._id">
          <td>{{ formatDate(row.date) }}</td>
          <td>¥{{ row.amount }}</td>
          <td>{{ row.description }}</td>
        </tr>
        <tr v-if="!rows.length"><td colspan="3" class="muted">データなし</td></tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const rows = ref([]);
const form = reactive({ date: new Date().toISOString().slice(0, 10), amount: 0, description: "" });
const showForm = ref(false);
const error = ref("");

async function load() {
  const { data } = await api.get(`/shops/${shopId}/finance/flr`);
  rows.value = data || [];
}

async function save() {
  await api.post(`/shops/${shopId}/finance/flr`, form);
  showForm.value = false;
  await load();
}

function toggleForm() {
  showForm.value = !showForm.value;
}

function formatDate(val) {
  return new Date(val).toLocaleDateString();
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.panel { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:16px; max-width:420px; margin-bottom:12px; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.ops { display:flex; justify-content:flex-end; gap:8px; }
.list { width:100%; border-collapse:collapse; background:#0f1522; border:1px solid #1f2636; }
.list th,.list td { padding:8px; border-bottom:1px solid #1f2636; }
.muted { text-align:center; color:#7b869f; }
.btn { background:#3b82f6; border:none; border-radius:6px; padding:6px 12px; color:#fff; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.err { color:#f87171; margin-bottom:8px; }
</style>
