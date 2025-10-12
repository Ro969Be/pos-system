<template>
  <div class="monitor">
    <h2>🧑‍💼 ホールモニター</h2>
    <div
      v-for="item in filteredItems"
      :key="item._id"
      :class="['item', { highlight: item.status === 'ready' }]"
    >
      <p>
        <strong>{{ item.product }}</strong> x {{ item.quantity }}
        （{{ item.table }}）
      </p>
      <button @click="markServed(item)">配膳済みにする</button>
    </div>
  </div>
</template>

<script lang="ts">
// ================================================
// HallMonitor.vue
// キッチン・ドリンカー連携用
// ================================================
import { defineComponent, ref, onMounted, computed } from "vue";
import axios from "@/api/axios";
import { io } from "socket.io-client";

export default defineComponent({
  name: "HallMonitor",
  setup() {
    const items = ref<any[]>([]);
    const socket = io("http://localhost:5000");

    const fetchItems = async () => {
      const res = await axios.get("/api/order-items");
      items.value = res.data;
    };

    socket.on("newOrderItem", (data: any) => {
      items.value.unshift(data);
    });

    socket.on("orderItemUpdated", (data: any) => {
      const idx = items.value.findIndex((i) => i._id === data._id);
      if (idx !== -1) items.value[idx] = data;
    });

    const markServed = async (item: any) => {
      const res = await axios.patch(`/api/order-items/${item._id}/status`, { status: "served" });
      socket.emit("updateOrderItemStatus", res.data);
    };

    onMounted(fetchItems);

    const filteredItems = computed(() =>
      items.value.filter((i) => i.status !== "served")
    );

    return { items, filteredItems, markServed };
  },
});
</script>

<style scoped>
.item {
  border: 1px solid #ddd;
  margin: 8px;
  padding: 10px;
  border-radius: 8px;
}
.highlight {
  background-color: #d4edda;
  animation: blink 1s infinite;
}
@keyframes blink {
  50% {
    opacity: 0.4;
  }
}
</style>
