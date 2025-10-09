<template>
  <div class="login">
    <h2>ログイン</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="メールアドレス" required />
      <input v-model="password" type="password" placeholder="パスワード" required />
      <button type="submit">ログイン</button>
    </form>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();
const auth = useAuthStore();

async function handleLogin() {
  try {
    await auth.login(email.value, password.value);
    router.push("/dashboard");
  } catch (err: any) {
    error.value = err.response?.data?.message || "ログイン失敗";
  }
}
</script>
