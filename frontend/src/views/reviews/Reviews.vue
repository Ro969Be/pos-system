<template>
  <section class="page">
    <header class="head">
      <h2>レビュー管理</h2>
      <button class="btn" @click="toggleForm">
        {{ showForm ? "閉じる" : "レビュー追加" }}
      </button>
    </header>
    <div v-if="error" class="err">{{ error }}</div>

    <form v-if="showForm" class="panel" @submit.prevent="createReview">
      <label class="field">
        <span>顧客名</span>
        <input v-model="form.customerName" required />
      </label>
      <label class="field">
        <span>評価 (1-5)</span>
        <input type="number" min="1" max="5" v-model.number="form.rating" required />
      </label>
      <label class="field">
        <span>コメント</span>
        <textarea v-model="form.comment" rows="3"></textarea>
      </label>
      <div class="ops">
        <button class="btn ghost" type="button" @click="toggleForm">キャンセル</button>
        <button class="btn" type="submit" :disabled="saving">
          {{ saving ? "保存中..." : "保存" }}
        </button>
      </div>
    </form>

    <div class="list">
      <article v-for="review in reviews" :key="review._id" class="card">
        <header>
          <strong>{{ review.customerName }}</strong>
          <span class="rating">★ {{ review.rating }}</span>
        </header>
        <p>{{ review.comment }}</p>
        <div class="photos" v-if="review.photos?.length">
          <img
            v-for="photo in review.photos"
            :key="photo._id"
            :src="photo.url"
            :alt="photo.caption"
          />
        </div>
        <form class="photo-form" @submit.prevent="addPhoto(review, review.newPhoto)">
          <input
            v-model="review.newPhoto"
            placeholder="写真URLを入力"
          />
          <button class="btn ghost" type="submit">写真を追加</button>
        </form>
      </article>
      <p v-if="!reviews.length" class="muted">レビューがありません</p>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const reviews = ref([]);
const error = ref("");
const showForm = ref(false);
const saving = ref(false);
const form = reactive({
  customerName: "",
  rating: 5,
  comment: "",
});

async function load() {
  const { data } = await api.get(`/shops/${shopId}/reviews`);
  reviews.value = (data || []).map((r) => ({ ...r, newPhoto: "" }));
}

function toggleForm() {
  showForm.value = !showForm.value;
  if (!showForm.value) {
    form.customerName = "";
    form.rating = 5;
    form.comment = "";
  }
}

async function createReview() {
  saving.value = true;
  try {
    await api.post(`/shops/${shopId}/reviews`, form);
    toggleForm();
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "作成に失敗しました";
  } finally {
    saving.value = false;
  }
}

async function addPhoto(review, url) {
  if (!url) return;
  await api.post(`/shops/${shopId}/reviews/${review._id}/photos`, { url });
  review.newPhoto = "";
  await load();
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.panel{ background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:16px; max-width:420px; margin-bottom:16px; }
.field{ display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.ops{ display:flex; justify-content:flex-end; gap:8px; }
.list{ display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px; }
.card{ background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:12px; }
.rating{ color:#facc15; }
.photos{ display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.photos img{ width:60px; height:60px; object-fit:cover; border-radius:6px; border:1px solid #1f2636; }
.photo-form{ display:flex; gap:6px; margin-top:10px; }
.btn{ background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; }
.btn.ghost{ background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.muted{ color:#7b869f; }
.err{ color:#f87171; margin-bottom:8px; }
input, textarea{ background:#0b1220; border:1px solid #28324a; border-radius:8px; color:#d5dbea; padding:8px; }
</style>
