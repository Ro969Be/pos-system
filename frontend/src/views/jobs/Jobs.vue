<template>
  <section class="page">
    <header class="head">
      <h2>求人管理</h2>
      <button class="btn" @click="toggleForm">{{ showForm ? "閉じる" : "募集追加" }}</button>
    </header>
    <div v-if="error" class="err">{{ error }}</div>

    <form v-if="showForm" class="panel" @submit.prevent="saveJob">
      <label class="field">
        <span>タイトル</span>
        <input v-model="form.title" required />
      </label>
      <label class="field">
        <span>雇用形態</span>
        <select v-model="form.employmentType">
          <option value="fullTime">正社員</option>
          <option value="partTime">アルバイト</option>
          <option value="contract">契約</option>
          <option value="intern">インターン</option>
        </select>
      </label>
      <label class="field">
        <span>給与</span>
        <input v-model="form.salary" />
      </label>
      <label class="field">
        <span>場所</span>
        <input v-model="form.location" />
      </label>
      <label class="field">
        <span>詳細</span>
        <textarea v-model="form.description" rows="3"></textarea>
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
          <th>雇用形態</th>
          <th>公開日</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="job in jobs" :key="job._id">
          <td>{{ job.title }}</td>
          <td>{{ job.status }}</td>
          <td>{{ job.employmentType }}</td>
          <td>{{ job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : "-" }}</td>
          <td>
            <button class="btn ghost" @click="updateStatus(job, 'published')">公開</button>
            <button class="btn ghost" @click="updateStatus(job, 'closed')">終了</button>
          </td>
        </tr>
        <tr v-if="!jobs.length"><td colspan="5" class="muted">求人がありません</td></tr>
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
const jobs = ref([]);
const error = ref("");
const showForm = ref(false);
const form = reactive({
  title: "",
  employmentType: "fullTime",
  salary: "",
  location: "",
  description: "",
});

async function load() {
  const { data } = await api.get(`/shops/${shopId}/jobs`);
  jobs.value = data || [];
}

function toggleForm() {
  showForm.value = !showForm.value;
}

async function saveJob() {
  await api.post(`/shops/${shopId}/jobs`, form);
  showForm.value = false;
  await load();
}

async function updateStatus(job, status) {
  await api.patch(`/shops/${shopId}/jobs/${job._id}`, { status });
  await load();
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.panel { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:16px; max-width:420px; margin-bottom:16px; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.ops { display:flex; justify-content:flex-end; gap:8px; }
.list { width:100%; border-collapse:collapse; background:#0f1522; border:1px solid #1f2636; }
.list th,.list td { padding:8px; border-bottom:1px solid #1f2636; }
.muted { text-align:center; color:#7b869f; padding:10px 0; }
.btn { background:#3b82f6; border:none; border-radius:6px; padding:6px 12px; color:#fff; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#3b82f6; margin-right:6px; }
.err { color:#f87171; margin-bottom:8px; }
textarea, input, select { background:#0b1220; border:1px solid #28324a; border-radius:8px; color:#d5dbea; padding:8px; }
</style>
