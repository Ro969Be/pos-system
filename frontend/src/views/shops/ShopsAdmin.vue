<template>
  <section class="admin-page">
    <header class="head">
      <h2>ショップ管理</h2>
      <button class="btn" @click="startCreate">新規ショップ</button>
    </header>

    <div v-if="error" class="err">{{ error }}</div>

    <table class="list">
      <thead>
        <tr>
          <th>名称</th>
          <th>種別</th>
          <th>電話</th>
          <th>メール</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="shop in shops" :key="shop._id">
          <td>{{ shop.shopName }}</td>
          <td>{{ shop.shopKind }}</td>
          <td>{{ shop.phone || "-" }}</td>
          <td>{{ shop.email || "-" }}</td>
          <td>
            <button class="btn ghost" @click="startEdit(shop)">編集</button>
            <router-link
              class="btn link"
              :to="`/admin/shops/${shop._id}/tables`"
              >テーブル</router-link
            >
            <button class="btn danger ghost" @click="remove(shop)" :disabled="busy">
              削除
            </button>
          </td>
        </tr>
        <tr v-if="!shops.length">
          <td colspan="5" class="muted">ショップがありません</td>
        </tr>
      </tbody>
    </table>

    <form class="panel" v-if="showForm" @submit.prevent="save">
      <h3>{{ form._id ? "ショップ編集" : "新規ショップ" }}</h3>
      <label class="field">
        <span>名称 *</span>
        <input v-model.trim="form.shopName" required />
      </label>
      <label class="field">
        <span>種別 *</span>
        <select v-model="form.shopKind" required>
          <option value="Restaurant">Restaurant</option>
          <option value="WebShop">WebShop</option>
          <option value="Salon">Salon</option>
        </select>
      </label>
      <div class="grid">
        <label class="field">
          <span>電話</span>
          <input v-model.trim="form.phone" />
        </label>
        <label class="field">
          <span>メール</span>
          <input v-model.trim="form.email" type="email" />
        </label>
      </div>
      <label class="field">
        <span>都道府県</span>
        <input v-model.trim="form.address.pref" />
      </label>
      <label class="field">
        <span>都市・市区</span>
        <input v-model.trim="form.address.city" />
      </label>
      <div class="ops">
        <button type="button" class="btn ghost" @click="cancel" :disabled="busy">
          キャンセル
        </button>
        <button type="submit" class="btn" :disabled="busy">
          {{ busy ? "保存中..." : "保存" }}
        </button>
      </div>
      <p v-if="formError" class="err">{{ formError }}</p>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import api from "@/lib/api";

const shops = ref([]);
const busy = ref(false);
const error = ref("");
const formError = ref("");
const showForm = ref(false);
const form = reactive({
  _id: null,
  shopName: "",
  shopKind: "Restaurant",
  phone: "",
  email: "",
  address: {
    pref: "",
    city: "",
  },
});

async function load() {
  error.value = "";
  try {
    const { data } = await api.get("/shops");
    shops.value = data || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "ショップ一覧の取得に失敗しました";
  }
}

function resetForm() {
  form._id = null;
  form.shopName = "";
  form.shopKind = "Restaurant";
  form.phone = "";
  form.email = "";
  form.address = { pref: "", city: "" };
}

function startCreate() {
  resetForm();
  showForm.value = true;
  formError.value = "";
}

function startEdit(shop) {
  showForm.value = true;
  formError.value = "";
  form._id = shop._id;
  form.shopName = shop.shopName || "";
  form.shopKind = shop.shopKind || "Restaurant";
  form.phone = shop.phone || "";
  form.email = shop.email || "";
  form.address = { ...(shop.address || {}) };
}

function cancel() {
  showForm.value = false;
  resetForm();
}

async function save() {
  if (!form.shopName) {
    formError.value = "名称は必須です";
    return;
  }
  formError.value = "";
  busy.value = true;
  try {
    if (form._id) {
      await api.patch(`/shops/${form._id}`, form);
    } else {
      await api.post("/shops", form);
    }
    await load();
    showForm.value = false;
    resetForm();
  } catch (e) {
    formError.value = e?.response?.data?.message || "保存に失敗しました";
  } finally {
    busy.value = false;
  }
}

async function remove(shop) {
  if (!confirm(`「${shop.shopName}」を削除しますか？`)) return;
  busy.value = true;
  try {
    await api.delete(`/shops/${shop._id}`);
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "削除に失敗しました";
  } finally {
    busy.value = false;
  }
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
  margin-bottom: 10px;
  gap: 6px;
}
input,
select {
  background: #0b1220;
  border: 1px solid #28324a;
  border-radius: 8px;
  padding: 8px;
  color: #d5dbea;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.ops {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
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
.btn.link {
  background: transparent;
  border: 1px solid #22c55e;
  color: #22c55e;
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
