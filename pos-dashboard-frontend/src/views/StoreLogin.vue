<!-- StoreLogin.vue -->
<template>
  <div class="store-login">
    <h2>店舗ログイン / 新規登録（簡易）</h2>

    <!-- 簡易ログイン: テンポコード + パスワード -->
    <div>
      <label>テンポコード（店舗コード）</label>
      <input v-model="tempoCode" placeholder="TEMPO123" />
    </div>

    <div>
      <label>パスワード</label>
      <input type="password" v-model="password" />
    </div>

    <button @click="handleLogin">ログイン</button>

    <p>新規登録（簡易フロー）</p>
    <button @click="handleRegister">店舗新規登録</button>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import api from "@/api/axios";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "StoreLogin",
  setup() {
    const tempoCode = ref("");
    const password = ref("");
    const message = ref("");
    const auth = useAuthStore();
    const router = useRouter();

    // 簡易ログイン：実運用ではテンポコード -> 店舗ID -> 認証のフローが必要
    const handleLogin = async () => {
      try {
        // ここは既存 auth API を利用する想定
        // 例: POST /api/auth/login に { email, password } を投げる
        // 今回はテンポコードを username 扱いで投げる簡易実装
        const res = await api.post("/auth/login", { email: tempoCode.value, password: password.value });
        // store にユーザー情報格納
        auth.user = res.data.user;
        auth.token = res.data.token;
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        sessionStorage.setItem("token", res.data.token);
        // 権限に応じて遷移
        if (auth.isAdmin()) {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      } catch (err: any) {
        console.error("ログイン失敗:", err);
        message.value = err.response?.data?.message || "ログインに失敗しました";
      }
    };

    // 簡易登録（実運用では詳細なバリデーションやメール確認等が必要）
    const handleRegister = async () => {
      try {
        const res = await api.post("/auth/register", { name: tempoCode.value, email: tempoCode.value, password: password.value, role: "store_admin" });
        auth.user = res.data.user;
        auth.token = res.data.token;
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        sessionStorage.setItem("token", res.data.token);
        router.push("/dashboard");
      } catch (err: any) {
        console.error("登録失敗:", err);
        message.value = err.response?.data?.message || "登録に失敗しました";
      }
    };

    return { tempoCode, password, handleLogin, handleRegister, message };
  },
});
</script>

<style scoped>
.store-login {
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
