<template>
  <section class="page">
    <header class="head">
      <h2>売上アナリティクス</h2>
      <div class="filters">
        <label>
          <span>From</span>
          <input type="date" v-model="from" @change="load" />
        </label>
        <label>
          <span>To</span>
          <input type="date" v-model="to" @change="load" />
        </label>
      </div>
    </header>
    <div v-if="error" class="err">{{ error }}</div>
    <div class="grid">
      <article class="card">
        <h3>日次売上</h3>
        <ul>
          <li v-for="day in dayGroups" :key="day.key">
            {{ day.key }} : ¥{{ day.total }} / {{ day.orders }}件
          </li>
        </ul>
      </article>
      <article class="card">
        <h3>商品ランキング</h3>
        <ul>
          <li v-for="item in products" :key="item._id">
            {{ item.productName }} - ¥{{ item.sales }} ({{ item.qty }} 個)
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const from = ref(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
const to = ref(new Date().toISOString().slice(0, 10));
const sales = ref([]);
const products = ref([]);
const error = ref("");

async function load() {
  error.value = "";
  const params = { from: from.value, to: to.value };
  const [salesRes, productRes] = await Promise.all([
    api.get(`/shops/${shopId}/analytics/sales`, { params }),
    api.get(`/shops/${shopId}/analytics/products`, { params }),
  ]);
  sales.value = salesRes.data || [];
  products.value = productRes.data || [];
}

const dayGroups = computed(() =>
  sales.value.reduce((acc, row) => {
    const key = new Date(row._id.day).toLocaleDateString();
    const existing = acc.find((item) => item.key === key);
    if (existing) {
      existing.total += row.total;
      existing.orders += row.orders;
    } else {
      acc.push({ key, total: row.total, orders: row.orders });
    }
    return acc;
  }, [])
);

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.filters { display:flex; gap:12px; }
.filters label { display:flex; flex-direction:column; font-size:0.85rem; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; }
.card { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:14px; }
.err { color:#f87171; margin-bottom:8px; }
</style>
