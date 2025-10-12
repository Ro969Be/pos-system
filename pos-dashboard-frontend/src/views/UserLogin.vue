<!-- UserLogin.vue -->
<template>
  <div class="user-login">
    <h2>一般ユーザーログイン / 新規登録（簡易）</h2>

    <div>
      <label>ユーザーネーム（またはメール）</label>
      <input v-model="username" />
    </div>

    <div>
      <label>パスワード</label>
      <input type="password" v-model="password" />
    </div>

    <button @click="handleLogin">ログイン</button>
    <button @click="handleRegister">新規登録</button>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import api from "@/api/axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "UserLogin",
  setup() {
    const username = ref("");
    const password = ref("");
    const message = ref("");
    const auth = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
      try {
        const res = await api.post("/auth/login", { email: username.value, password: password.value });
        auth.user = res.data.user;
        auth.token = res.data.token;
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        sessionStorage.setItem("token", res.data.token);
        router.push("/restaurants"); // 例: 飲食店一覧ページ
      } catch (err: any) {
        console.error(err);
        message.value = err.response?.data?.message || "ログイン失敗";
      }
    };

    const handleRegister = async () => {
      try {
        const res = await api.post("/auth/register", { name: username.value, email: username.value, password: password.value, role: "user" });
        auth.user = res.data.user;
        auth.token = res.data.token;
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        sessionStorage.setItem("token", res.data.token);
        router.push("/restaurants");
      } catch (err: any) {
        console.error(err);
        message.value = err.response?.data?.message || "登録失敗";
      }
    };

    return { username, password, handleLogin, handleRegister, message };
  },
});
</script>

<style scoped>
.user-login {
  padding: 20px;
  max-width: 480px;
  margin: 0 auto;
}
input {
  width: 100%;
  margin-bottom: 8px;
  padding: 6px;
}
</style>
