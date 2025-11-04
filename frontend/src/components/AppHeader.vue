<template>
  <header class="app-header">
    <div class="left">
      <!-- ハンバーガー：<1080pxで表示 -->
      <button class="icon-btn burger" @click="toggleSidebar()" aria-label="open menu">☰</button>
      <router-link to="/public/shops" class="brand">POS Portal</router-link>
    </div>

    <nav class="right">
      <router-link to="/store/login" class="hd-link">店舗様はこちら</router-link>

      <div class="user-dd">
        <button class="user-chip" @click="open = !open">
          <span class="avatar">👤</span>
          <span>{{ auth.user?.name ?? 'ゲスト' }}</span>
          <span class="caret">▾</span>
        </button>
        <div class="menu" v-if="open">
          <router-link to="/account/profile" class="item">プロフィール</router-link>
          <button class="item danger" @click="logout">ログアウト</button>
        </div>
      </div>

      <button class="icon-btn gear" aria-label="settings">⚙</button>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { auth } from "@/lib/auth";
import { toggleSidebar } from "@/lib/ui";

const open = ref(false);
const onDoc = (e) => { if (!e.target.closest('.user-dd')) open.value = false; };
onMounted(() => document.addEventListener('click', onDoc));
onBeforeUnmount(() => document.removeEventListener('click', onDoc));

const logout = () => { alert("ログアウト（仮）"); open.value = false; };
</script>

<style src="@/styles/components/header.css"></style>
