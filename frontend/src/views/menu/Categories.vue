<template>
  <section class="page">
    <header class="head">
      <h2>カテゴリー管理</h2>
      <button class="btn" @click="startCreate">追加</button>
    </header>
    <div v-if="error" class="err">{{ error }}</div>
    <table class="list">
      <thead>
        <tr>
          <th>名称</th>
          <th>タイプ</th>
          <th>表示順</th>
          <th>状態</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat._id">
          <td>{{ cat.name }}</td>
          <td>{{ cat.type }}</td>
          <td>{{ cat.orderNo }}</td>
          <td>{{ cat.activeFlag ? "表示" : "非表示" }}</td>
          <td>
            <button class="btn ghost" @click="edit(cat)">編集</button>
            <button class="btn danger ghost" @click="remove(cat)">削除</button>
          </td>
        </tr>
        <tr v-if="!categories.length">
          <td colspan="5" class="muted">カテゴリーがありません</td>
        </tr>
      </tbody>
    </table>

    <form v-if="showForm" class="panel" @submit.prevent="save">
      <h3>{{ form._id ? "カテゴリー編集" : "カテゴリー追加" }}</h3>
      <label class="field">
        <span>名称</span>
        <input v-model.trim="form.name" required />
      </label>
      <label class="field">
        <span>タイプ</span>
        <select v-model="form.type">
          <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
        </select>
      </label>
      <label class="field">
        <span>表示順</span>
        <input type="number" v-model.number="form.orderNo" />
      </label>
      <label class="check">
        <input type="checkbox" v-model="form.activeFlag" /> 表示
      </label>
      <div class="ops">
        <button class="btn ghost" type="button" @click="cancel">キャンセル</button>
        <button class="btn" type="submit">{{ saving ? "保存中..." : "保存" }}</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const categories = ref([]);
const error = ref("");
const saving = ref(false);
const showForm = ref(false);
const types = ["Course", "Drink", "Food", "Lunch", "SalonMenu"];
const form = reactive({
  _id: null,
  name: "",
  type: "Food",
  orderNo: 0,
  activeFlag: true,
});

async function load() {
  try {
    const { data } = await api.get(`/shops/${shopId}/categories`);
    categories.value = data || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "取得に失敗しました";
  }
}

function startCreate() {
  Object.assign(form, { _id: null, name: "", type: "Food", orderNo: 0, activeFlag: true });
  showForm.value = true;
}
function edit(cat) {
  Object.assign(form, cat);
  showForm.value = true;
}
function cancel() {
  showForm.value = false;
}
async function save() {
  saving.value = true;
  try {
    if (form._id) {
      await api.patch(`/shops/${shopId}/categories/${form._id}`, form);
    } else {
      await api.post(`/shops/${shopId}/categories`, form);
    }
    await load();
    showForm.value = false;
  } catch (e) {
    error.value = e?.response?.data?.message || "保存に失敗しました";
  } finally {
    saving.value = false;
  }
}
async function remove(cat) {
  if (!confirm(`「${cat.name}」を削除しますか？`)) return;
  try {
    await api.delete(`/shops/${shopId}/categories/${cat._id}`);
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "削除に失敗しました";
  }
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.list { width:100%; border-collapse:collapse; background:#0f1522; border:1px solid #1f2636; }
.list th,.list td{ padding:8px; border-bottom:1px solid #1f2636; }
.panel{ margin-top:16px; background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:16px; max-width:420px; }
.field{ display:flex; flex-direction:column; margin-bottom:10px; gap:6px; }
.check{ display:flex; align-items:center; gap:6px; margin-bottom:10px; }
.btn{ background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; }
.btn.ghost{ background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.btn.danger{ border-color:#ef4444; color:#ef4444; }
.ops{ display:flex; justify-content:flex-end; gap:8px; }
.err{ color:#f87171; margin-bottom:8px; }
.muted{ text-align:center; color:#7b869f; padding:8px 0; }
input, select{ background:#0b1220; border:1px solid #28324a; border-radius:8px; color:#d5dbea; padding:8px; }
</style>
