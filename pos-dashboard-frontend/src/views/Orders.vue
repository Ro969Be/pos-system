<!-- Orders.vue -->

<template>
  <div>
    <h1>注文一覧</h1>
    <ul>
      <li v-for="order in orders" :key="order._id">
        {{ order.customerName }} - {{ order.totalPrice?.toLocaleString() || 0 }}円 - {{ order.status }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const orders = ref<any[]>([]);

onMounted(async () => {
  const res = await axios.get("http://localhost:5000/api/orders");
  orders.value = res.data;
});
</script>
