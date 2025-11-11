<!-- frontend/src/views/auth/StoreLogin.vue -->
<template>
  <section class="page">
    <h2>お店ログイン</h2>
    <form class="panel" @submit.prevent="onSubmit">
      <label class="field">
        <span>お店ログインID</span>
        <input v-model="loginId" required />
      </label>
      <label class="field">
        <span>パスワード</span>
        <input v-model="password" type="password" required />
      </label>
      <div class="ops">
        <router-link class="btn ghost" to="/public/shops">戻る</router-link>
        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログイン' }}
        </button>
      </div>
      <p v-if="err" class="err">{{ err }}</p>
    </form>

    <p class="sub">※ ログイン後に所属店舗の一覧が表示されます。</p>
    <!-- ▼ 追加：新規店舗作成リンク -->
    <p class="cta">
      はじめての方は
      <router-link to="/store-auth/register-owner">新規店舗作成はこちら</router-link>
    </p>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { businessLogin, selectStore } from "@/lib/storeAuth";
import { joinStore } from "@/lib/socket";

const router = useRouter();
const route = useRoute();

const loginId = ref("");
const password = ref("");
const loading = ref(false);
const err = ref("");

async function onSubmit() {
  err.value = "";
  loading.value = true;
  try {
    const stores = await businessLogin(loginId.value, password.value);
    if (!stores || stores.length === 0) throw new Error("店舗が見つかりません");

    if (stores.length === 1) {
      const s = stores[0];
      await selectStore(s.id);
      joinStore(s.id);
      router.push("/store/settings");
    } else {
      sessionStorage.setItem("biz.stores", JSON.stringify(stores));
      router.push("/store-auth/select");
    }
  } catch (e) {
    err.value = e?.response?.data?.message || e?.message || "ログインに失敗しました";
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
.cta{ margin-top:12px; color:#cfd6e3; }
.cta a{ color:#93c5fd; text-decoration: underline; }
</style>
