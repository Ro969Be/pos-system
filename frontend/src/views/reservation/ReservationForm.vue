<template>
  <section class="form-page">
    <h2>予約作成</h2>
    <form class="panel" @submit.prevent="submit">
      <label class="field">
        <span>顧客名 *</span>
        <input v-model.trim="form.customerName" required />
      </label>
      <label class="field">
        <span>電話番号</span>
        <input v-model.trim="form.contactPhone" />
      </label>
      <label class="field">
        <span>メール</span>
        <input v-model.trim="form.contactEmail" type="email" />
      </label>
      <label class="field">
        <span>開始日時 *</span>
        <input type="datetime-local" v-model="form.startTime" required />
      </label>
      <label class="field">
        <span>滞在時間(分)</span>
        <input type="number" min="30" step="15" v-model.number="form.durationMinutes" />
      </label>
      <label class="field">
        <span>人数 *</span>
        <input type="number" min="1" v-model.number="form.partySize.total" required />
      </label>
      <label class="field">
        <span>メモ</span>
        <textarea v-model="form.memo" rows="3"></textarea>
      </label>
      <p v-if="error" class="err">{{ error }}</p>
      <div class="ops">
        <router-link class="btn ghost" :to="backLink">戻る</router-link>
        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? "作成中..." : "作成" }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const router = useRouter();
const shopId = route.params.shopId;

const form = reactive({
  customerName: "",
  contactPhone: "",
  contactEmail: "",
  startTime: new Date().toISOString().slice(0, 16),
  durationMinutes: 90,
  partySize: { total: 2 },
  memo: "",
});

const loading = ref(false);
const error = ref("");
const backLink = computed(() => `/admin/shops/${shopId}/reservations`);

async function submit() {
  loading.value = true;
  error.value = "";
  try {
    await api.post(`/shops/${shopId}/reservations`, form);
    router.push(backLink.value);
  } catch (e) {
    error.value = e?.response?.data?.message || "予約の作成に失敗しました";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.form-page {
  padding: 16px;
}
.panel {
  background: #0f1522;
  border: 1px solid #1f2636;
  border-radius: 12px;
  padding: 16px;
  max-width: 480px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
input,
textarea {
  background: #0b1220;
  border: 1px solid #28324a;
  border-radius: 8px;
  padding: 8px;
  color: #d5dbea;
}
.ops {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}
.btn {
  background: #3b82f6;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.btn.ghost {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}
.err {
  color: #f87171;
  margin-bottom: 8px;
}
</style>
