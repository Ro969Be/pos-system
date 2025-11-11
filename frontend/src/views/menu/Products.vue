<template>
  <section class="page">
    <header class="head">
      <h2>商品管理</h2>
      <button class="btn" @click="startCreate">商品追加</button>
    </header>

    <div v-if="error" class="err">{{ error }}</div>

    <table class="list">
      <thead>
        <tr>
          <th>名称</th>
          <th>カテゴリ</th>
          <th>価格</th>
          <th>Tax</th>
          <th>KDS</th>
          <th>調理秒</th>
          <th>状態</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prod in products" :key="prod._id">
          <td>{{ prod.name }}</td>
          <td>{{ categoryName(prod.categoryId) }}</td>
          <td>¥{{ prod.price }}</td>
          <td>{{ prod.taxClass }}</td>
          <td>{{ prod.kdsStation }}</td>
          <td>{{ prod.stdPrepSeconds }}</td>
          <td>{{ prod.activeFlag ? "販売中" : "停止" }}</td>
        </tr>
        <tr v-if="!products.length">
          <td colspan="7" class="muted">商品がありません</td>
        </tr>
      </tbody>
    </table>

    <form v-if="showForm" class="panel" @submit.prevent="save">
      <h3>商品追加</h3>
      <label class="field">
        <span>名称</span>
        <input v-model.trim="form.name" required />
      </label>
      <label class="field">
        <span>カテゴリ</span>
        <select v-model="form.categoryId" required>
          <option disabled value="">選択してください</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
      </label>
      <label class="field">
        <span>価格</span>
        <input type="number" min="0" v-model.number="form.price" required />
      </label>
      <label class="field">
        <span>Tax</span>
        <select v-model="form.taxClass">
          <option value="inclusive">税込</option>
          <option value="exclusive">税別</option>
          <option value="non">対象外</option>
        </select>
      </label>
      <label class="field">
        <span>KDS</span>
        <select v-model="form.kdsStation">
          <option value="Kitchen">Kitchen</option>
          <option value="Drink">Drink</option>
          <option value="Hall">Hall</option>
        </select>
      </label>
      <label class="field">
        <span>標準調理秒</span>
        <input type="number" min="0" v-model.number="form.stdPrepSeconds" />
      </label>
      <label class="field">
        <span>SKU</span>
        <input v-model.trim="form.sku" />
      </label>
      <label class="field">
        <span>アレルギー</span>
        <input v-model.trim="allergenInput" placeholder="カンマ区切り" />
      </label>
      <label class="check">
        <input type="checkbox" v-model="form.activeFlag" /> 販売中
      </label>
      <h4>バリエーション</h4>
      <div
        class="variation"
        v-for="(variation, idx) in form.variations"
        :key="idx"
      >
        <input v-model.trim="variation.name" placeholder="名称" />
        <input
          type="number"
          v-model.number="variation.priceDiff"
          placeholder="価格差"
        />
        <label>
          <input type="checkbox" v-model="variation.requiredFlag" />
          必須
        </label>
        <button class="btn danger ghost" type="button" @click="removeVariation(idx)">
          削除
        </button>
      </div>
      <button class="btn ghost" type="button" @click="addVariation">
        バリエーションを追加
      </button>
      <div class="ops">
        <button class="btn ghost" type="button" @click="cancel">キャンセル</button>
        <button class="btn" type="submit" :disabled="saving">
          {{ saving ? "保存中..." : "保存" }}
        </button>
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
const products = ref([]);
const categories = ref([]);
const error = ref("");
const saving = ref(false);
const showForm = ref(false);
const allergenInput = ref("");
const form = reactive({
  name: "",
  categoryId: "",
  price: 0,
  taxClass: "inclusive",
  kdsStation: "Kitchen",
  stdPrepSeconds: 600,
  sku: "",
  activeFlag: true,
  variations: [],
});

async function load() {
  try {
    const [prodRes, catRes] = await Promise.all([
      api.get(`/shops/${shopId}/products`),
      api.get(`/shops/${shopId}/categories`),
    ]);
    products.value = prodRes.data || [];
    categories.value = catRes.data || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "取得に失敗しました";
  }
}

function categoryName(id) {
  const cat = categories.value.find((c) => c._id === id);
  return cat ? cat.name : "-";
}

function startCreate() {
  Object.assign(form, {
    name: "",
    categoryId: categories.value[0]?._id || "",
    price: 0,
    taxClass: "inclusive",
    kdsStation: "Kitchen",
    stdPrepSeconds: 600,
    sku: "",
    activeFlag: true,
    variations: [],
  });
  allergenInput.value = "";
  showForm.value = true;
}
function cancel() {
  showForm.value = false;
}
function addVariation() {
  form.variations.push({ name: "", priceDiff: 0, requiredFlag: false });
}
function removeVariation(idx) {
  form.variations.splice(idx, 1);
}
async function save() {
  saving.value = true;
  try {
    const payload = {
      ...form,
      allergens: allergenInput.value
        ? allergenInput.value.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    await api.post(`/shops/${shopId}/products`, payload);
    showForm.value = false;
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "保存に失敗しました";
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.list { width:100%; border-collapse:collapse; background:#0f1522; border:1px solid #1f2636; margin-bottom:16px; }
.list th,.list td{ padding:8px; border-bottom:1px solid #1f2636; }
.panel{ background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:16px; max-width:600px; }
.field{ display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.variation{ display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.btn{ background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; }
.btn.ghost{ background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.btn.danger{ border-color:#ef4444; color:#ef4444; }
.ops{ display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
.err{ color:#f87171; margin-bottom:8px; }
.muted{ text-align:center; color:#7b869f; padding:10px 0; }
input, select{ background:#0b1220; border:1px solid #28324a; border-radius:8px; color:#d5dbea; padding:8px; }
</style>
