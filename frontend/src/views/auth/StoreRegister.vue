<!-- frontend/src/views/auth/StoreRegister.vue -->
<template>
  <section class="page">
    <h2>店舗様 新規登録</h2>
    <form class="panel" @submit.prevent="onSubmit">
      <label class="field"><span>店舗名</span><input v-model="shopName" required /></label>
      <label class="field"><span>店舗コード</span><input v-model="storeCode" required placeholder="例: TOKYO-001" /></label>
      <label class="field"><span>担当者名</span><input v-model="ownerName" required /></label>
      <label class="field"><span>メール</span><input v-model="email" type="email" required/></label>
      <label class="field"><span>パスワード</span><input v-model="password" type="password" required/></label>
      <div class="ops">
        <router-link class="btn ghost" to="/store-auth/login">戻る</router-link>
        <button class="btn" type="submit" :disabled="loading">{{ loading ? '登録中...' : '登録して開始' }}</button>
      </div>
      <p v-if="err" class="err">{{ err }}</p>
    </form>
  </section>
</template>

<script setup>
import { ref } from "vue";
import api from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import { useRouter } from "vue-router";
import { joinStore } from "@/lib/socket";

const router = useRouter();
const shopName = ref("");
const storeCode = ref("");
const ownerName = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const err = ref("");

async function onSubmit() {
  err.value = "";
  loading.value = true;
  try {
    // 1) 店舗作成
    await api.post("/api/stores", { name: shopName.value, code: storeCode.value });

    // 2) オーナー登録（トークン返却）
    const { data } = await api.post("/api/auth/owner/register", {
      storeCode: storeCode.value,
      name: ownerName.value,
      email: email.value,
      password: password.value,
    });

    // 3) トークン保存 → me取得 → joinStore → ダッシュボードへ
    localStorage.setItem("token", data.token);
    const me = await fetchMe();
    if (me?.store?.id) joinStore(me.store.id);
    router.push("/store/dashboard");
  } catch (e) {
    err.value = e?.response?.data?.message || "登録に失敗しました";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page{ padding:16px; }
.panel{ background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:14px; max-width:640px; }
.field{ display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.field span{ color:#cfd6e3; font-size:.9rem; }
input{ background:#0b1220; color:#d5dbea; border:1px solid #28324a; border-radius:10px; padding:8px 10px; }
.ops{ display:flex; gap:8px; margin-top:8px; }
.btn{ background:#3b82f6; color:#fff; border:none; border-radius:8px; padding:8px 12px; cursor:pointer; }
.btn.ghost{ background:#182033; color:#d5dbea; border:1px solid #28324a; }
.err{ margin-top:10px; color:#fca5a5; }
</style>
