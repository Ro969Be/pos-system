<template>
  <section class="order-detail">
    <header class="head">
      <h2>注文詳細</h2>
      <div class="meta">
        <p>ID: {{ order?._id }}</p>
        <p>状態: {{ order?.status }}</p>
        <p>合計: ¥{{ order?.total }}</p>
      </div>
    </header>

    <div v-if="error" class="err">{{ error }}</div>

    <div v-if="order" class="grid">
      <div class="panel">
        <h3>明細</h3>
        <ul>
          <li v-for="item in order.items" :key="item._id">
            {{ item.name }} x {{ item.qty }} = ¥{{ item.lineTotal }}
          </li>
        </ul>
      </div>
      <div class="panel">
        <h3>支払い</h3>
        <p>支払合計: ¥{{ order.paymentSummary?.paidTotal || 0 }}</p>
        <p>お釣り: ¥{{ order.paymentSummary?.changeDue || 0 }}</p>
        <form @submit.prevent="addPayment">
          <label class="field">
            <span>方法</span>
            <select v-model="payment.method">
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="PayPay">PayPay</option>
              <option value="EMoney">EMoney</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label class="field">
            <span>金額</span>
            <input type="number" min="1" v-model.number="payment.amount" />
          </label>
          <button class="btn" type="submit" :disabled="paying">
            {{ paying ? "処理中..." : "支払い追加" }}
          </button>
        </form>
        <p v-if="paymentMessage" class="note">{{ paymentMessage }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const orderId = route.params.orderId;
const order = ref(null);
const error = ref("");
const paying = ref(false);
const paymentMessage = ref("");
const payment = ref({ amount: 0, method: "Cash" });

async function load() {
  try {
    const { data } = await api.get(`/orders/${orderId}`);
    order.value = data;
  } catch (e) {
    error.value = e?.response?.data?.message || "注文取得に失敗しました";
  }
}

async function addPayment() {
  paying.value = true;
  paymentMessage.value = "";
  try {
    const { data } = await api.post(`/orders/${orderId}/payments`, payment.value);
    paymentMessage.value = `検証: ${data.validationRule}, 釣銭: ¥${data.change || 0}`;
    await load();
  } catch (e) {
    paymentMessage.value =
      e?.response?.data?.message ||
      `エラー: ${e?.response?.data?.validationRule || ""}`;
  } finally {
    paying.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.order-detail { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:flex-start; }
.panel { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:16px; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin-top:16px; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:8px; }
.btn { background:#3b82f6; border:none; color:#fff; padding:6px 12px; border-radius:6px; cursor:pointer; }
.err { color:#f87171; margin-top:12px; }
.note { margin-top:8px; color:#cbd5f5; }
</style>
