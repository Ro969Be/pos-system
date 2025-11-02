<script setup>
import { ref, onMounted } from "vue";
import api from "./lib/api";

const msg = ref("loading...");
const err = ref("");

onMounted(async () => {
  try {
    const res = await api.get("/");
    msg.value = res.data;
  } catch (e) {
    err.value = e.message;
  }
});
</script>

<template>
  <main style="padding: 16px">
    <h1>Backend 接続テスト</h1>
    <p v-if="err">❌ Error: {{ err }}</p>
    <p v-else>✅ Response: {{ msg }}</p>
  </main>
</template>
