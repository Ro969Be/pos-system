<template>
  <section class="page">
    <h2>お客様ログイン</h2>
    <p class="sub">メールアドレスとパスワードでログインしてください。</p>

    <form class="panel" @submit.prevent="onSubmit">
      <label class="field">
        <span>メールアドレス / 電話番号</span>
        <input
          v-model.trim="form.identifier"
          type="text"
          required
          placeholder="user@example.com もしくは 09012345678"
          autocomplete="username"
        />
      </label>

      <label class="field">
        <span>パスワード</span>
        <input
          v-model="form.password"
          type="password"
          required
          autocomplete="current-password"
          placeholder="********"
        />
      </label>

      <div class="ops">
        <router-link class="btn ghost" to="/register">アカウントを作成</router-link>
        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? "ログイン中..." : "ログイン" }}
        </button>
      </div>

      <p v-if="err" class="err">{{ err }}</p>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { loginUser } from "@/lib/auth";

const router = useRouter();
const route = useRoute();

const form = reactive({
  identifier: "",
  password: "",
});
const loading = ref(false);
const err = ref("");

async function onSubmit() {
  err.value = "";
  loading.value = true;
  try {
    await loginUser({
      identifier: form.identifier,
      password: form.password,
    });
    const next = route.query.next || "/public/shops";
    router.push(next);
  } catch (e) {
    console.error("Failed to login user", e);
    err.value =
      e?.response?.data?.message ||
      "ログインに失敗しました。入力内容をご確認ください。";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  padding: 16px;
  max-width: 520px;
}
.sub {
  margin: 12px 0;
  color: #9fb0c9;
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
  flex-wrap: wrap;
}
.btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn.ghost {
  background: #182033;
  color: #d5dbea;
  border: 1px solid #28324a;
}
.err {
  margin-top: 10px;
  color: #fca5a5;
}
</style>
