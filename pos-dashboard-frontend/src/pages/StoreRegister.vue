<!-- src/pages/StoreRegister.vue -->
<!-- 店舗新規登録ページ -->

<template>
  <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
    <h2 class="text-2xl font-bold mb-4">店舗新規登録</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium">店舗コード</label>
        <input v-model="form.storeCode" class="border p-2 w-full rounded" required />
      </div>

      <div>
        <label class="block text-sm font-medium">店舗名</label>
        <input v-model="form.storeName" class="border p-2 w-full rounded" required />
      </div>

      <div>
        <label class="block text-sm font-medium">住所</label>
        <input v-model="form.address" class="border p-2 w-full rounded" />
      </div>

      <div>
        <label class="block text-sm font-medium">電話番号</label>
        <input v-model="form.phone" class="border p-2 w-full rounded" />
      </div>

      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        :disabled="loading"
      >
        {{ loading ? "登録中..." : "登録" }}
      </button>
    </form>

    <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
    <p v-if="success" class="text-green-600 mt-3">{{ success }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useShopStore } from "@/stores/shops";

const storeStore = useShopStore();

const form = reactive({
  storeCode: "",
  storeName: "",
  address: "",
  phone: "",
});

const loading = ref(false);
const error = ref("");
const success = ref("");

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = "";
    success.value = "";

    await storeStore.registerStore(form);
    success.value = "店舗登録が完了しました！";

    // フォームをクリア
    Object.assign(form, { storeCode: "", storeName: "", address: "", phone: "" });
  } catch (err: any) {
    error.value = storeStore.error || "登録に失敗しました";
  } finally {
    loading.value = false;
  }
};
</script>
