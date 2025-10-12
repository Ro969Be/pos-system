<!-- src/pages/StoreList.vue -->
<!-- 登録済み店舗一覧（管理者専用） -->

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">店舗一覧</h2>

    <button
      class="bg-green-600 text-white px-4 py-2 rounded mb-4"
      @click="fetchStores"
    >
      再読み込み
    </button>

    <table class="min-w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 border">店舗コード</th>
          <th class="p-2 border">店舗名</th>
          <th class="p-2 border">住所</th>
          <th class="p-2 border">電話番号</th>
          <th class="p-2 border">登録者</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="store in storeStore.stores" :key="store._id">
          <td class="p-2 border">{{ store.storeCode }}</td>
          <td class="p-2 border">{{ store.storeName }}</td>
          <td class="p-2 border">{{ store.address }}</td>
          <td class="p-2 border">{{ store.phone }}</td>
          <td class="p-2 border">{{ store.owner?.name || "-" }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="storeStore.error" class="text-red-600 mt-3">{{ storeStore.error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useShopStore } from "@/stores/shops";

const storeStore = useShopStore();

const fetchStores = async () => {
  await storeStore.fetchStores();
};

onMounted(() => {
  fetchStores();
});
</script>
