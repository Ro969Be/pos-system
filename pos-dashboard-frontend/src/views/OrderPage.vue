<!-- pos-dashboard-frontend/src/views/OrderPage.vue -->
<template>
  <div class="order-page">
    <h1>🧾 オーダー入力ページ</h1>

    <!-- テーブル -->
    <div class="field">
      <label>テーブル：</label>
      <input v-model="table" placeholder="例: テーブル1" />
    </div>

    <!-- 商品選択（簡易。実運用では Product 一覧から選択） -->
    <div class="field">
      <label>商品（既存の product.id を渡せる前提）</label>
      <select v-model="selectedProductId" @change="onProductChange">
        <option value="">選択してください</option>
        <option v-for="p in products" :key="p._id" :value="p._id">
          {{ p.name }} ({{ p.category }})
        </option>
      </select>
    </div>

    <!-- 数量 -->
    <div class="field">
      <label>数量：</label>
      <input type="number" v-model.number="quantity" min="1" />
    </div>

    <!-- 自動割当提供時間（プリセット） -->
    <div class="field">
      <label>提供時間（分）: 自動設定（プリセット）または手動で上書き可</label>
      <input type="number" v-model.number="provideTime" min="1" />
    </div>

    <button @click="submitOrder">✅ 送信</button>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script lang="ts">
// ================================================
// OrderPage.vue（プリセット対応版）
// - 商品選択時にカテゴリを確認して CategoryPreset を取得し provideTime をセット
// - その後 API により DB 登録し Socket.emit でモニターに通知
// ================================================
import { defineComponent, ref, onMounted } from "vue";
import api from "@/api/axios";
import { io } from "socket.io-client";

export default defineComponent({
  name: "OrderPage",
  setup() {
    const socket = io("http://localhost:5000");
    const products = ref<any[]>([]);
    const presets = ref<any[]>([]);

    const selectedProductId = ref<string>("");
    const table = ref<string>("");
    const quantity = ref<number>(1);
    const provideTime = ref<number | null>(null);
    const message = ref<string>("");

    // 商品一覧取得（既存 API）
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        products.value = res.data;
      } catch (err) {
        console.error("❌ 商品取得失敗:", err);
      }
    };

    // プリセット一覧取得（管理 UI と同じデータ）
    const fetchPresets = async () => {
      try {
        const res = await api.get("/category-presets?activeOnly=true");
        presets.value = res.data;
      } catch (err) {
        console.error("❌ プリセット取得失敗:", err);
      }
    };

    // 商品選択が変わったらプリセットを反映する
    const onProductChange = async () => {
      // 選択商品を探す
      const p = products.value.find((x: any) => x._id === selectedProductId.value);
      if (!p) {
        provideTime.value = null;
        return;
      }

      // 1) もし商品オブジェクトに provideTime があれば優先
      if (p.provideTime) {
        provideTime.value = p.provideTime;
        return;
      }

      // 2) それ以外はプリセットからカテゴリ一致のものを探す
      const preset = presets.value.find((r: any) => r.category === p.category && r.isActive);
      if (preset) {
        provideTime.value = preset.provideTime;
      } else {
        provideTime.value = null;
      }
    };

    // 送信
    const submitOrder = async () => {
      if (!selectedProductId.value || !table.value) {
        message.value = "テーブルと商品を選択してください。";
        return;
      }

      // product は ID を送る（バックエンドで productId -> category を参照して provideTime を補完する場合もある）
      const productId = selectedProductId.value;
      const p = products.value.find((x: any) => x._id === productId);
      const station = p?.category === "drink" ? "drinker" : "kitchen";

      const payload: any = {
        product: productId,
        quantity,
        table: table.value,
        station,
      };

      if (provideTime != null) payload.provideTime = provideTime;

      try {
        const res = await api.post("/order-items", payload); // 注意: フロントの axios ベースは /api に向けている想定
        // ルート側で Socket.emit する実装があるならここは不要だが、互換性のため emit も行う
        socket.emit("newOrderItem", res.data);

        message.value = "注文を送信しました";
        // リセット
        selectedProductId.value = "";
        table.value = "";
        quantity.value = 1;
        provideTime.value = null;
      } catch (err) {
        console.error("❌ 注文送信失敗:", err);
        message.value = "送信に失敗しました";
      }
    };

    onMounted(() => {
      fetchProducts();
      fetchPresets();
    });

    return {
      products,
      presets,
      selectedProductId,
      table,
      quantity,
      provideTime,
      submitOrder,
      onProductChange,
      message,
    };
  },
});
</script>

<style scoped>
.order-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
.field {
  margin-bottom: 12px;
}
</style>
