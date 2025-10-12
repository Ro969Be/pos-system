<template>
  <div class="monitor">
    <h2>👨‍🍳 キッチンモニター</h2>
    <div v-for="item in filteredItems" :key="item._id" :class="['item', { overdue: isOverdue(item) }]">
      <p><strong>{{ item.product }}</strong> x {{ item.quantity }}（{{ item.table }}）</p>
      <button @click="markReady(item)">調理完了</button>
    </div>
  </div>
</template>

<script lang="ts">
// ================================================
// KitchenMonitor.vue
// 提供時間経過アラート付き
// ================================================
import { defineComponent, ref, onMounted, computed } from "vue";
import axios from "@/api/axios";
import { io } from "socket.io-client";

export default defineComponent({
  name: "KitchenMonitor",
  setup() {
    const items = ref<any[]>([]);
    const socket = io("http://localhost:5000");

    const fetchItems = async () => {
      const res = await axios.get("/api/order-items?station=kitchen");
      items.value = res.data;
    };

    socket.on("newOrderItem", (data: any) => {
      if (data.station === "kitchen") items.value.unshift(data);
    });

    socket.on("orderItemUpdated", (data: any) => {
      const idx = items.value.findIndex((i) => i._id === data._id);
      if (idx !== -1) items.value[idx] = data;
    });

    const markReady = async (item: any) => {
      const res = await axios.patch(`/api/order-items/${item._id}/status`, { status: "ready" });
      socket.emit("updateOrderItemStatus", res.data);
    };

    const isOverdue = (item: any) => {
      const elapsed = (Date.now() - new Date(item.createdAt).getTime()) / 60000;
      return elapsed > item.provideTime;
    };

    onMounted(fetchItems);

    const filteredItems = computed(() => items.value.filter((i) => i.status === "pending"));

    return { items, filteredItems, markReady, isOverdue };
  },
});
</script>

<style scoped>
.item {
  border: 1px solid #ccc;
  margin: 8px;
  padding: 10px;
  border-radius: 8px;
}
.overdue {
  animation: blink 1s infinite;
  background-color: #ffcccc;
}
@keyframes blink {
  50% {
    opacity: 0.3;
  }
}
</style>
