<template>
  <section class="page">
    <h2>店舗様 新規登録</h2>
    <form class="panel" @submit.prevent="register">
      <label class="field"><span>店舗名</span><input v-model="shopName" required/></label>
      <label class="field"><span>担当者名</span><input v-model="ownerName" required/></label>
      <label class="field"><span>メール</span><input v-model="email" type="email" required/></label>
      <label class="field"><span>パスワード</span><input v-model="password" type="password" required/></label>
      <div class="ops">
        <router-link class="btn ghost" to="/store-auth/login">戻る</router-link>
        <button class="btn" type="submit">登録（デモ）</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginMock } from "@/lib/auth";

const router = useRouter();
const shopName = ref(""); const ownerName = ref(""); const email = ref(""); const password = ref("");

function register(){
  // 後でAPI連携。今は登録後そのままログイン扱いでダッシュボードへ
  loginMock(ownerName.value || "店舗オーナー");
  router.push("/store/dashboard");
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
</style>
