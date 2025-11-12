<template>
  <section class="page auth">
    <h2>ログイン</h2>
    <p class="sub">※ダミー動作。認証は後でAPI連携します。</p>

    <div class="auth-grid">
      <!-- メール/パスワード -->
      <form class="panel" @submit.prevent="loginEmail">
        <h3>メールでログイン</h3>
        <label class="field">
          <span>メールアドレス</span>
          <input v-model="email" type="email" placeholder="you@example.com" required />
        </label>
        <label class="field">
          <span>パスワード</span>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </label>
        <button class="btn" type="submit">ログイン</button>
        <p class="muted">
          アカウントがない方は
          <router-link to="/register">新規登録</router-link>
        </p>
      </form>

      <!-- LINE -->
      <div class="panel">
        <h3>LINEでログイン</h3>
        <p class="muted">※後でLINEログインSDK連携。今はダミー遷移。</p>
        <button class="btn line" @click="loginLine">LINEでログイン</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const password = ref("");

function loginEmail() {
  // TODO: API連携。今はダミーでトップへ
  alert(`メールログイン（ダミー）: ${email.value}`);
  router.push("/public/shops");
}
function loginLine() {
  // TODO: LINEログイン開始。今はダミーでトップへ
  alert("LINEログイン開始（ダミー）");
  router.push("/public/shops");
}
</script>

<style src="../styles/pages/Auth.css"></style>
