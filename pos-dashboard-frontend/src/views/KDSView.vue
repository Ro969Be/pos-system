<!-- KDSView.vue -->
<template>
  <div class="kds-container">
    <h2>{{ stationLabel }} モニター</h2>

    <div class="kds-items">
      <div
        v-for="item in orderItems"
        :key="item._id"
        :class="['kds-card', item.status, { alert: isOverTime(item) }]"
        @click="cycleStatus(item)"
      >
        <h3>{{ item.product }}</h3>
        <p>数量: {{ item.quantity }}</p>
        <p>経過: {{ elapsed(item) }}分 / 設定: {{ item.provideTime }}分</p>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import axios from "axios";

export default {
  name: "KDSView",
  data() {
    return {
      socket: null,
      orderItems: [],
      station: "kitchen", // "drinker" にも切替可
    };
  },
  computed: {
    stationLabel() {
      return this.station === "kitchen" ? "キッチン" : "ドリンカー";
    },
  },
  methods: {
    async fetchItems() {
      const res = await axios.get(`/api/order-items?station=${this.station}`);
      this.orderItems = res.data;
    },
    elapsed(item) {
      const diff = (Date.now() - new Date(item.createdAt)) / 60000;
      return Math.floor(diff);
    },
    isOverTime(item) {
      return this.elapsed(item) > item.provideTime && item.status !== "served";
    },
    async cycleStatus(item) {
      const next =
        item.status === "pending"
          ? "ready"
          : item.status === "ready"
          ? "served"
          : "pending";
      await axios.patch(`/api/order-items/${item._id}/status`, { status: next });
    },
  },
  mounted() {
    this.socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    this.socket.on("orderItemUpdated", (data) => {
      const idx = this.orderItems.findIndex((x) => x._id === data.id);
      if (idx >= 0) this.orderItems[idx].status = data.status;
    });
    this.fetchItems();
  },
};
</script>

<style scoped>
.kds-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.kds-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.kds-card {
  background: #fff;
  padding: 10px;
  border-radius: 10px;
  width: 180px;
  cursor: pointer;
  transition: 0.3s;
}
.kds-card.ready {
  background: #ffe8a3;
}
.kds-card.served {
  background: #a3ffb4;
}
.kds-card.alert {
  border: 2px solid red;
  animation: blink 1s infinite;
}
@keyframes blink {
  50% {
    opacity: 0.5;
  }
}
</style>
