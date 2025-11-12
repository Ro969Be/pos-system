<!-- frontend/src/views/auth/StoreSelect.vue -->
<template>
  <section class="page">
    <h2>店舗を選択</h2>
    <ul class="panel list">
      <li v-for="s in stores" :key="s.id" class="row">
        <div>
          <div class="ttl">{{ s.name }}</div>
          <div class="sub">コード: {{ s.code }} / 種別: {{ mapType(s.type) }}</div>
        </div>
        <button class="btn" @click="choose(s.id)">選択</button>
      </li>
    </ul>
    <p v-if="err" class="err">{{ err }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { selectStore } from "@/lib/storeAuth";
import { joinStore } from "@/lib/socket"; // ← 参加させる

const router = useRouter();
const stores = ref([]);
const err = ref("");

function mapType(t){
  return t==="restaurant" ? "飲食店"
       : t==="salon"      ? "サロン"
       : t==="webshop"    ? "WEB店舗"
       : "その他";
}

onMounted(async () => {
  // StoreLogin.vue で sessionStorage に保存しておいた一覧を取り出す
  const raw = sessionStorage.getItem("biz.stores");
  if (!raw) {
    err.value = "ログインからやり直してください";
    return router.push("/store-auth/login");
  }
  try {
    stores.value = JSON.parse(raw) || [];
  } catch {
    err.value = "店舗一覧の取得に失敗しました";
  }
});

async function choose(id) {
  try {
    // ★ ここが肝：店舗スコープの JWT を取得
    await selectStore(id);
    // Socket.IO の店舗ルームに参加
    joinStore(id);
    // 一覧を破棄してから設定へ
    sessionStorage.removeItem("biz.stores");
    router.push("/store/settings");
  } catch (e) {
    err.value = e?.response?.data?.message || "選択に失敗しました";
  }
}
</script>

<style src="@/styles/pages/List.css"></style>
