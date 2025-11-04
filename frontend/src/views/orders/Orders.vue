<template>
  <main class="orders-page">
    <h1>注文</h1>
    <OrderItemCard
      v-for="o in orders" :key="o.id"
      :order="o" :expanded="expandedId === o.id"
      @toggleDetails="toggleDetails"
      @receipt="onReceipt"
      @problem="onProblem"
      @track="onTrack"
      @return="onReturn"
      @rateSeller="onRateSeller"
      @review="onReview"
      @buyAgain="onBuyAgain"
    />
  </main>
</template>

<script setup>
import { ref } from "vue";
import OrderItemCard from "./OrderItemCard.vue";

// ダミーデータ（実装時はAPI接続）
const orders = ref([
  {
    id: "2025-1104-0001",
    orderedAt: "2025/11/02",
    total: 12980,
    shipTo: { name: "山田 太郎", zip: "100-0001", address: "東京都千代田区千代田1-1" },
    items: [
      { sku: "SKU-1", title: "オリジナルカクテルセット", qty: 1, price: 9980 },
      { sku: "SKU-2", title: "シェイカー（ステンレス）", qty: 1, price: 3000 },
    ],
  },
  {
    id: "2025-1104-0002",
    orderedAt: "2025/10/30",
    total: 3980,
    shipTo: { name: "山田 太郎", zip: "100-0001", address: "東京都千代田区千代田1-1" },
    items: [
      { sku: "SKU-3", title: "メジャーカップ", qty: 2, price: 1990 },
    ],
  },
]);

const expandedId = ref(null);
function toggleDetails(id){ expandedId.value = expandedId.value === id ? null : id; }

// 操作ハンドラ（必要に応じて実装）
function onReceipt(id){ /* 領収書PDF生成 */ }
function onProblem(id){ /* 問い合わせ起票 */ }
function onTrack(id){ /* 追跡へ */ }
function onReturn(id){ /* 返品/交換フロー */ }
function onRateSeller(id){ /* 出品者を評価 */ }
function onReview(id){ /* レビュー投稿へ */ }
function onBuyAgain(id){ /* カートに追加して購入に進むなど */ }
</script>

<style scoped>
.orders-page{ padding:16px; }
</style>
