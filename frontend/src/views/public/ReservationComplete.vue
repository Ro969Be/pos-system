<template>
  <section class="page complete-page">
    <div class="card">
      <h2 class="title">予約を受け付けました</h2>

      <ul class="summary">
        <li><span>店舗</span><b>{{ shopName }}</b></li>
        <li><span>日付</span><b>{{ q.date || "-" }}</b></li>
        <li><span>時間</span><b>{{ q.time || "-" }}</b></li>
        <li><span>人数</span><b>{{ q.people || "-" }} 名</b></li>
        <li><span>お名前</span><b>{{ q.name || "-" }}</b></li>
        <li v-if="q.phone"><span>電話</span><b>{{ q.phone }}</b></li>
        <li v-if="q.note"><span>メモ</span><b>{{ q.note }}</b></li>
      </ul>

      <div class="actions">
        <router-link class="btn ghost" to="/public/shops">店舗一覧へ戻る</router-link>
        <button class="btn" @click="makeAnother">別の予約を作る</button>
      </div>

      <p class="hint">※ 現在はデモ表示です。実際の予約確定・通知は未接続（後でAPI連携）。</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { shops } from "@/lib/dummy/shops";

const route = useRoute();
const router = useRouter();
const q = route.query; // 予約フォームからの値

const shopName = computed(() => {
  const s = shops.find(v => String(v.id) === String(q.shopId || ""));
  return s ? s.name : "（未選択）";
});

const makeAnother = () => {
  const params = new URLSearchParams();
  if (q.shopId) params.set("shopId", String(q.shopId));
  router.push(`/public/reservations?${params.toString()}`);
};
</script>

<style src="../../styles/pages/ReservationComplete.css"></style>
