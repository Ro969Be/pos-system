<template>
  <section class="admin-page">
    <header class="head">
      <h2>テーブル管理 - {{ shopId }}</h2>
      <button class="btn" @click="startCreate">テーブル追加</button>
    </header>

    <div v-if="error" class="err">{{ error }}</div>

    <table class="list">
      <thead>
        <tr>
          <th>名称</th>
          <th>階層</th>
          <th>収容人数</th>
          <th>タイプ</th>
          <th>状態</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tbl in tables" :key="tbl._id">
          <td>{{ tbl.tableName }}</td>
          <td>{{ tbl.floor || "-" }}</td>
          <td>{{ tbl.capacity }}</td>
          <td>{{ tbl.type }}</td>
          <td>
            <span v-if="tbl.lock">
              ロック中 ({{ lockLabel(tbl.lock) }})
            </span>
            <span v-else>利用可能</span>
          </td>
          <td>
            <button class="btn ghost" @click="startEdit(tbl)">編集</button>
            <button class="btn ghost" @click="toggleLock(tbl)">
              {{ tbl.lock ? "ロック解除" : "仮押さえ" }}
            </button>
            <button class="btn danger ghost" @click="remove(tbl)" :disabled="busy">
              削除
            </button>
          </td>
        </tr>
        <tr v-if="!tables.length">
          <td colspan="6" class="muted">テーブルがありません</td>
        </tr>
      </tbody>
    </table>

    <form class="panel" v-if="showForm" @submit.prevent="save">
      <h3>{{ form._id ? "テーブル編集" : "テーブル追加" }}</h3>
      <label class="field">
        <span>名称 *</span>
        <input v-model.trim="form.tableName" required />
      </label>
      <label class="field">
        <span>階層</span>
        <input v-model.trim="form.floor" />
      </label>
      <div class="grid">
        <label class="field">
          <span>収容人数 *</span>
          <input v-model.number="form.capacity" type="number" min="1" required />
        </label>
        <label class="field">
          <span>タイプ</span>
          <select v-model="form.type">
            <option value="table">table</option>
            <option value="counter">counter</option>
            <option value="private">private</option>
            <option value="terrace">terrace</option>
          </select>
        </label>
      </div>
      <label class="check">
        <input type="checkbox" v-model="form.isPrivate" />
        個室
      </label>
      <label class="check">
        <input type="checkbox" v-model="form.isSmoking" />
        喫煙可
      </label>
      <div class="ops">
        <button class="btn ghost" type="button" @click="cancel" :disabled="busy">
          キャンセル
        </button>
        <button class="btn" type="submit" :disabled="busy">
          {{ busy ? "保存中..." : "保存" }}
        </button>
      </div>
      <p v-if="formError" class="err">{{ formError }}</p>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const tables = ref([]);
const error = ref("");
const formError = ref("");
const busy = ref(false);
const showForm = ref(false);
const form = reactive({
  _id: null,
  tableName: "",
  floor: "",
  capacity: 2,
  type: "table",
  isPrivate: false,
  isSmoking: false,
});

async function load() {
  error.value = "";
  try {
    const { data } = await api.get(`/shops/${shopId}/tables`);
    tables.value = data || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "テーブル取得に失敗しました";
  }
}

function startCreate() {
  form._id = null;
  form.tableName = "";
  form.floor = "";
  form.capacity = 2;
  form.type = "table";
  form.isPrivate = false;
  form.isSmoking = false;
  showForm.value = true;
  formError.value = "";
}

function startEdit(tbl) {
  form._id = tbl._id;
  form.tableName = tbl.tableName;
  form.floor = tbl.floor || "";
  form.capacity = tbl.capacity;
  form.type = tbl.type || "table";
  form.isPrivate = !!tbl.isPrivate;
  form.isSmoking = !!tbl.isSmoking;
  showForm.value = true;
  formError.value = "";
}

function cancel() {
  showForm.value = false;
}

async function save() {
  if (!form.tableName) {
    formError.value = "名称は必須です";
    return;
  }
  if (!form.capacity || form.capacity < 1) {
    formError.value = "収容人数は1以上で入力してください";
    return;
  }
  formError.value = "";
  busy.value = true;
  try {
    if (form._id) {
      await api.patch(`/shops/${shopId}/tables/${form._id}`, form);
    } else {
      await api.post(`/shops/${shopId}/tables`, form);
    }
    await load();
    showForm.value = false;
  } catch (e) {
    formError.value = e?.response?.data?.message || "保存に失敗しました";
  } finally {
    busy.value = false;
  }
}

async function remove(tbl) {
  if (!confirm(`${tbl.tableName} を削除しますか？`)) return;
  busy.value = true;
  try {
    await api.delete(`/shops/${shopId}/tables/${tbl._id}`);
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "削除に失敗しました";
  } finally {
    busy.value = false;
  }
}

async function toggleLock(tbl) {
  busy.value = true;
  try {
    await api.patch(`/shops/${shopId}/tables/${tbl._id}/lock`, {
      action: tbl.lock ? "unlock" : "lock",
      holdMinutes: 15,
    });
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "ロック操作に失敗しました";
  } finally {
    busy.value = false;
  }
}

function lockLabel(lock) {
  if (!lock) return "-";
  const until = lock.expiresAt ? new Date(lock.expiresAt) : null;
  return until ? `${until.toLocaleTimeString()}` : "未設定";
}

onMounted(load);
</script>

<style scoped>
.admin-page {
  padding: 16px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.list {
  width: 100%;
  border-collapse: collapse;
  background: #0f1522;
  border: 1px solid #1f2636;
  margin-bottom: 16px;
}
.list th,
.list td {
  padding: 8px;
  border-bottom: 1px solid #1f2636;
}
.panel {
  background: #0f1522;
  border: 1px solid #1f2636;
  border-radius: 12px;
  padding: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
input,
select {
  background: #0b1220;
  border: 1px solid #28324a;
  border-radius: 8px;
  padding: 8px;
  color: #d5dbea;
}
.check {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.ops {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn {
  background: #3b82f6;
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.btn.ghost {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}
.btn.danger {
  border-color: #ef4444;
  color: #ef4444;
}
.err {
  color: #f87171;
  margin-bottom: 8px;
}
.muted {
  color: #7b869f;
  text-align: center;
}
</style>
