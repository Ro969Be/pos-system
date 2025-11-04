<template>
  <section class="page reserve-page">
    <h2 class="page-title">予約フォーム</h2>

    <form class="reserve-form" @submit.prevent="submit">
      <div class="row">
        <label>店舗</label>
        <select v-model="form.shopId" required>
          <option disabled value="">店舗を選択</option>
          <option v-for="s in shops" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>

      <div class="row two">
        <div>
          <label>日付</label>
          <input type="date" v-model="form.date" required />
        </div>
        <div>
          <label>時間</label>
          <input type="time" v-model="form.time" required />
        </div>
      </div>

      <div class="row two">
        <div>
          <label>人数</label>
          <input type="number" min="1" max="20" v-model.number="form.people" required />
        </div>
        <div>
          <label>お名前</label>
          <input type="text" v-model="form.name" required placeholder="山田 太郎" />
        </div>
      </div>

      <div class="row">
        <label>電話番号</label>
        <input type="tel" v-model="form.phone" placeholder="090-1234-5678" />
      </div>

      <div class="row">
        <label>ご要望</label>
        <textarea v-model="form.note" rows="4" placeholder="アレルギー等があれば記載ください"></textarea>
      </div>

      <div class="actions">
        <button type="button" class="btn ghost" @click="goBack">← 戻る</button>
        <button type="submit" class="btn primary">内容を確認して予約</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { shops } from "@/lib/dummy/shops";

const route = useRoute();
const router = useRouter();

const form = reactive({
  shopId: "",
  date: "",
  time: "",
  people: 2,
  name: "",
  phone: "",
  note: "",
});

// クエリ ?shopId=xxx があれば初期選択
onMounted(() => {
  const q = Number(route.query.shopId);
  if (q && shops.some(s => Number(s.id) === q)) form.shopId = q;
});

// 送信（今はダミー：URLクエリで完了画面に渡す）
const submit = () => {
  const params = new URLSearchParams({
    shopId: String(form.shopId || ""),
    date: form.date || "",
    time: form.time || "",
    people: String(form.people || 0),
    name: form.name || "",
    phone: form.phone || "",
    note: form.note || "",
  });
  router.push(`/public/reservations/complete?${params.toString()}`);
};

const goBack = () => {
  // 店舗詳細から来た想定／なければ一覧へ
  const fallback = "/public/shops";
  const fromDetail = route.query.shopId
    ? `/public/shops/${route.query.shopId}`
    : fallback;
  router.push(fromDetail);
};
</script>

<style src="../../styles/pages/Reservations.css"></style>
