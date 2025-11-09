<!-- frontend/src/views/auth/StoreLogin.vue -->
<template>
  <section class="page">
    <h2>店舗様ログイン</h2>
    <form class="panel" @submit.prevent="onSubmit">
      <label class="field"><span>メール</span><input v-model="email" type="email" required /></label>
      <label class="field"><span>パスワード</span><input v-model="password" type="password" required /></label>
      <div class="ops">
        <router-link class="btn ghost" to="/public/shops">戻る</router-link>
        <button class="btn" type="submit" :disabled="loading">{{ loading ? 'ログイン中...' : 'ログイン' }}</button>
      </div>
      <p v-if="err" class="err">{{ err }}</p>
    </form>
    <p class="sub">店舗様向けアカウントをお持ちでない方は
      <router-link to="/store-auth/register">新規登録</router-link>
    </p>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { login, currentUser } from "@/lib/auth";
import { joinStore } from "@/lib/socket";

const router = useRouter();
const route = useRoute();
const email = ref("");
const password = ref("");
const loading = ref(false);
const err = ref("");

async function onSubmit() {
  err.value = "";
  loading.value = true;
  try {
    const user = await login(email.value, password.value);
    // Socket 参加
    joinStore(user?.store?.id);
    // リダイレクト
    const next = route.query.next || "/store/dashboard";
    router.push(String(next));
  } catch (e) {
    err.value = e?.response?.data?.message || "ログインに失敗しました";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page{ padding:16px; }
.panel{ background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:14px; max-width:520px; }
.field{ display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.field span{ color:#cfd6e3; font-size:.9rem; }
input{ background:#0b1220; color:#d5dbea; border:1px solid #28324a; border-radius:10px; padding:8px 10px; }
.ops{ display:flex; gap:8px; margin-top:8px; }
.btn{ background:#3b82f6; color:#fff; border:none; border-radius:8px; padding:8px 12px; cursor:pointer; }
.btn.ghost{ background:#182033; color:#d5dbea; border:1px solid #28324a; }
.sub{ margin-top:10px; color:#9fb0c9; }
.err{ margin-top:10px; color:#fca5a5; }
</style>
