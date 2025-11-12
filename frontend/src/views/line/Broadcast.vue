<template>
  <section class="page">
    <header class="head">
      <h2>LINE ブロードキャスト</h2>
      <button class="btn" @click="toggleForm">{{ showForm ? "閉じる" : "新規作成" }}</button>
    </header>
    <div v-if="error" class="err">{{ error }}</div>

    <form v-if="showForm" class="panel" @submit.prevent="createBroadcast">
      <label class="field">
        <span>タイトル</span>
        <input v-model="form.title" required />
      </label>
      <label class="field">
        <span>本文</span>
        <textarea v-model="form.body" rows="4" required></textarea>
      </label>
      <div class="ops">
        <button class="btn ghost" type="button" @click="toggleForm">キャンセル</button>
        <button class="btn" type="submit">保存</button>
      </div>
    </form>

    <table class="list">
      <thead>
        <tr>
          <th>タイトル</th>
          <th>状態</th>
          <th>送信日時</th>
          <th>Stats</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bc in broadcasts" :key="bc._id">
          <td>{{ bc.title }}</td>
          <td>{{ bc.status }}</td>
          <td>{{ bc.sentAt ? new Date(bc.sentAt).toLocaleString() : "-" }}</td>
          <td>配信: {{ bc.stats?.delivered || 0 }} / 既読: {{ bc.stats?.read || 0 }}</td>
          <td>
            <button class="btn ghost" @click="send(bc)" :disabled="bc.status === 'sent'">送信</button>
          </td>
        </tr>
        <tr v-if="!broadcasts.length"><td colspan="5" class="muted">メッセージがありません</td></tr>
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
const broadcasts = ref([]);
const error = ref("");
const showForm = ref(false);
const form = reactive({ title: "", body: "" });

async function load() {
  const { data } = await api.get(`/shops/${shopId}/line/broadcasts`);
  broadcasts.value = data || [];
}

async function createBroadcast() {
  await api.post(`/shops/${shopId}/line/broadcasts`, form);
  showForm.value = false;
  form.title = "";
  form.body = "";
  await load();
}

async function send(bc) {
  await api.post(`/shops/${shopId}/line/broadcasts/${bc._id}/send`);
  await load();
}

function toggleForm() {
  showForm.value = !showForm.value;
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.panel { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:16px; max-width:480px; margin-bottom:16px; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.ops { display:flex; justify-content:flex-end; gap:8px; }
.list { width:100%; border-collapse:collapse; background:#0f1522; border:1px solid #1f2636; }
.list th,.list td { padding:8px; border-bottom:1px solid #1f2636; }
.btn { background:#3b82f6; border:none; border-radius:6px; padding:6px 12px; color:#fff; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.muted { text-align:center; color:#7b869f; padding:10px 0; }
.err { color:#f87171; margin-bottom:8px; }
textarea, input { background:#0b1220; border:1px solid #28324a; border-radius:8px; color:#d5dbea; padding:8px; }
</style>
