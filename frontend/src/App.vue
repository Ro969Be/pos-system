<template>
  <div class="app-root" :class="{ '-sb-open': ui.sidebarOpen }">
    <AppHeader />
    <div class="app-body">
      <AppSidebar :open="ui.sidebarOpen" />
      <main class="app-main">
        <router-view />
      </main>
    </div>

    <!-- モバイル時のオーバーレイ（ヘッダーは除外） -->
    <div
      class="sb-overlay"
      v-if="ui.sidebarOpen"
      @click="closeSidebar()"
    />
  </div>
</template>

<script setup>
import AppHeader from "@/components/AppHeader.vue";
import AppSidebar from "@/components/AppSidebar.vue";
import { ui, closeSidebar } from "@/lib/ui";
</script>

<style src="@/styles/styles.css"></style>
<style src="@/styles/components/header.css"></style>
<style src="@/styles/components/sidebar.css"></style>
