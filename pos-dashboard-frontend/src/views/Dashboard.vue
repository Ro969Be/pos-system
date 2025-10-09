<template>
  <div class="dashboard">
    <h1>POS管理ダッシュボード</h1>

    <!-- ログインユーザー情報 -->
    <div class="user-info">
      <p v-if="auth.user">
        👤 {{ auth.user.name }}（{{ auth.user.role === "admin" ? "管理者" : "スタッフ" }}）
      </p>
      <p v-else>👤 未ログイン状態です</p>

      <button @click="handleLogout">ログアウト</button>
    </div>

    <hr />

    <!-- ナビゲーション -->
    <nav>
      <router-link to="/products">商品管理</router-link> |
      <router-link to="/orders">注文管理</router-link> |
      <router-link to="/reports">売上レポート</router-link>
      <span v-if="auth.isAdmin()"> | <router-link to="/admin">管理者パネル</router-link></span>
    </nav>

    <!-- 子ルートをここに表示 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.user-info {
  margin-bottom: 10px;
}

nav a {
  margin: 0 8px;
}
</style>
