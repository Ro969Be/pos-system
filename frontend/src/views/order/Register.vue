<template>
  <section class="register">
    <header class="head">
      <h2>POSレジ</h2>
      <div class="filters">
        <label>
          <span>カテゴリ</span>
          <select v-model="selectedCategory">
            <option value="">すべて</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>
        </label>
      </div>
    </header>

    <div class="content">
      <div class="products">
        <article
          v-for="product in filteredProducts"
          :key="product._id"
          class="card"
        >
          <h4>{{ product.name }}</h4>
          <p class="price">¥{{ product.price }}</p>
          <p class="kds">KDS: {{ product.kdsStation }}</p>
          <button class="btn" @click="addToCart(product)">追加</button>
        </article>
        <div v-if="!filteredProducts.length" class="muted">
          商品がありません
        </div>
      </div>

      <aside class="cart">
        <h3>カート</h3>
        <div
          v-for="item in cart"
          :key="item.productId"
          class="cart-item"
        >
          <div>
            <strong>{{ item.name }}</strong>
            <p>¥{{ item.price }}</p>
          </div>
          <input
            type="number"
            min="1"
            v-model.number="item.qty"
          />
          <button class="btn ghost" @click="removeFromCart(item.productId)">
            削除
          </button>
        </div>
        <div class="summary">
          <p>小計: ¥{{ subtotal }}</p>
        </div>
        <button class="btn primary" @click="createOrder" :disabled="loading || !cart.length">
          {{ loading ? "送信中..." : "注文を作成" }}
        </button>
        <p v-if="orderId" class="success">
          注文ID: {{ orderId }}
        </p>
        <p v-if="error" class="err">{{ error }}</p>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const categories = ref([]);
const products = ref([]);
const cart = ref([]);
const selectedCategory = ref("");
const loading = ref(false);
const error = ref("");
const orderId = ref("");

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value;
  return products.value.filter((p) => p.categoryId === selectedCategory.value);
});

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.price * item.qty, 0)
);

async function load() {
  const [catRes, prodRes] = await Promise.all([
    api.get(`/shops/${shopId}/categories`),
    api.get(`/shops/${shopId}/products`),
  ]);
  categories.value = catRes.data || [];
  products.value = prodRes.data || [];
}

function addToCart(product) {
  const existing = cart.value.find((c) => c.productId === product._id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.value.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      qty: 1,
    });
  }
}

function removeFromCart(productId) {
  cart.value = cart.value.filter((c) => c.productId !== productId);
}

async function createOrder() {
  loading.value = true;
  error.value = "";
  orderId.value = "";
  try {
    const payload = {
      items: cart.value.map((item) => ({
        productId: item.productId,
        qty: item.qty,
      })),
    };
    const { data } = await api.post(`/shops/${shopId}/orders`, payload);
    orderId.value = data?._id || "";
    cart.value = [];
  } catch (e) {
    error.value = e?.response?.data?.message || "注文作成に失敗しました";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.register { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.content { display:flex; gap:16px; }
.products { flex:3; display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
.card { background:#0f1522; border:1px solid #1f2636; border-radius:10px; padding:12px; }
.price { font-size:1.2rem; margin:4px 0; }
.btn { background:#3b82f6; border:none; color:#fff; padding:6px 10px; border-radius:6px; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.btn.primary { width:100%; margin-top:12px; }
.cart { flex:1; background:#111629; border:1px solid #1f2636; border-radius:12px; padding:12px; }
.cart-item { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.cart-item input{ width:60px; background:#0b1220; border:1px solid #28324a; color:#d5dbea; border-radius:6px; padding:4px; }
.summary { margin-top:12px; font-weight:bold; }
.muted { color:#7b869f; }
.err { color:#f87171; margin-top:8px; }
.success { color:#4ade80; margin-top:8px; }
</style>
