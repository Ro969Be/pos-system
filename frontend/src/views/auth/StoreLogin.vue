<template>
  <section class="page">
    <h2>スタッフ / 店舗ログイン</h2>
    <form class="panel" @submit.prevent="onSubmit">
      <label class="field">
        <span>メールまたは電話番号</span>
        <input v-model.trim="identifier" autocomplete="username" required />
      </label>
      <label class="field">
        <span>店舗ID（任意 / 複数店舗の場合）</span>
        <input v-model.trim="shopId" placeholder="ShopId（MongoID）" />
      </label>
      <label class="field">
        <span>パスワード</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </label>
      <div class="ops">
        <router-link class="btn ghost" to="/public/shops">戻る</router-link>
        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? "ログイン中..." : "ログイン" }}
        </button>
      </div>
      <p v-if="err" class="err">{{ err }}</p>
    </form>
    <p class="sub">
      ログイン後に権限や担当店舗が自動で割り当てられます。複数店舗に所属している場合は店舗IDを指定してください。
    </p>
    <p class="cta">
      はじめての方は
      <router-link to="/store-auth/register-owner"
        >新規店舗作成はこちら</router-link
      >
    </p>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/lib/api";
import { fetchMe } from "@/lib/auth";

const router = useRouter();
const route = useRoute();

const identifier = ref("");
const shopId = ref("");
const password = ref("");
const err = ref("");
const loading = ref(false);

async function onSubmit() {
  err.value = "";
  loading.value = true;
  try {
    const payload = {
      identifier: identifier.value,
      password: password.value,
    };
    if (shopId.value) payload.shopId = shopId.value;
    const { data } = await api.post("/auth/login", payload);
    if (!data?.token) throw new Error("トークンを取得できませんでした");
    localStorage.setItem("token", data.token);
    await fetchMe();
    const next = route.query.next || "/store/dashboard";
    router.push(next);
  } catch (e) {
    err.value =
      e?.response?.data?.message || e?.message || "ログインに失敗しました";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  padding: 16px;
  max-width: 560px;
}
.panel {
  background: #0f1522;
  border: 1px solid #1f2636;
  border-radius: 12px;
  padding: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.field span {
  color: #cfd6e3;
  font-size: 0.9rem;
}
input {
  background: #0b1220;
  color: #d5dbea;
  border: 1px solid #28324a;
  border-radius: 10px;
  padding: 8px 10px;
}
.ops {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.btn.ghost {
  background: #182033;
  color: #d5dbea;
  border: 1px solid #28324a;
}
.sub {
  margin-top: 12px;
  color: #9fb0c9;
}
.err {
  margin-top: 10px;
  color: #fca5a5;
}
.cta {
  margin-top: 12px;
  color: #cfd6e3;
}
.cta a {
  color: #93c5fd;
  text-decoration: underline;
}
</style>
