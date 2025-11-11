<template>
  <section class="page">
    <header class="head">
      <h2>在庫管理</h2>
    </header>
    <div v-if="error" class="err">{{ error }}</div>
    <table class="list">
      <thead>
        <tr>
          <th>商品</th>
          <th>在庫</th>
          <th>閾値</th>
          <th>HideZero</th>
          <th>LowNote</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prod in products" :key="prod._id">
          <td>{{ prod.name }}</td>
          <td>
            <input
              type="number"
              v-model.number="inventoryMap[prod._id].stockQty"
              class="qty"
            />
          </td>
          <td>
            <input
              type="number"
              v-model.number="inventoryMap[prod._id].lowStockThreshold"
              class="qty"
            />
          </td>
          <td>
            <input
              type="checkbox"
              v-model="inventoryMap[prod._id].hideWhenZero"
            />
          </td>
          <td>
            <input
              type="checkbox"
              v-model="inventoryMap[prod._id].lowStockNoteFlag"
            />
          </td>
          <td>
            <button class="btn ghost" @click="saveInventory(prod._id)">
              保存
            </button>
          </td>
        </tr>
        <tr v-if="!products.length">
          <td colspan="6" class="muted">商品がありません</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const products = ref([]);
const inventoryMap = reactive({});
const error = ref("");

async function load() {
  try {
    const { data } = await api.get(`/shops/${shopId}/products`);
    products.value = data || [];
    for (const prod of products.value) {
      const invRes = await api.get(`/shops/${shopId}/inventory/${prod._id}`).catch(() => ({ data: null }));
      inventoryMap[prod._id] = {
        stockQty: invRes.data?.stockQty ?? 0,
        lowStockThreshold: invRes.data?.lowStockThreshold ?? 5,
        hideWhenZero: invRes.data?.hideWhenZero ?? false,
        lowStockNoteFlag: invRes.data?.lowStockNoteFlag ?? false,
      };
    }
  } catch (e) {
    error.value = e?.response?.data?.message || "在庫取得に失敗しました";
  }
}

async function saveInventory(productId) {
  try {
    const payload = inventoryMap[productId];
    await api.put(`/shops/${shopId}/inventory/${productId}`, payload);
  } catch (e) {
    error.value = e?.response?.data?.message || "保存に失敗しました";
  }
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.list { width:100%; border-collapse:collapse; background:#0f1522; border:1px solid #1f2636; }
.list th,.list td{ padding:8px; border-bottom:1px solid #1f2636; }
.qty{ width:80px; background:#0b1220; border:1px solid #28324a; border-radius:6px; color:#d5dbea; padding:4px 6px; }
.btn{ background:#3b82f6; color:#fff; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; }
.btn.ghost{ background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.err{ color:#f87171; margin-bottom:8px; }
.muted{ text-align:center; color:#7b869f; padding:10px 0; }
</style>
