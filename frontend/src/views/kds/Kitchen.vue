<template>
  <section class="kds">
    <header class="head">
      <h2>Kitchen KDS</h2>
      <button class="btn ghost" @click="load">更新</button>
    </header>
    <div class="board">
      <article
        v-for="ticket in tickets"
        :key="ticket._id"
        class="card"
        :class="[ticket.status, ticket.alertState]"
      >
        <h3>{{ ticket.productName }}</h3>
        <p>Qty: {{ ticket.qty }}</p>
        <p>Table: {{ ticket.tableId || "-" }}</p>
        <p>Status: {{ ticket.status }}</p>
        <div class="actions">
          <button
            v-if="ticket.status === 'new'"
            class="btn"
            @click="mutate(ticket._id, 'start')"
          >
            Start
          </button>
          <button
            v-if="['new', 'inProgress'].includes(ticket.status)"
            class="btn"
            @click="mutate(ticket._id, 'ready')"
          >
            Ready
          </button>
          <button class="btn ghost" @click="mutate(ticket._id, 'revert')">
            Revert
          </button>
        </div>
      </article>
      <p v-if="!tickets.length" class="muted">チケットはありません</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const station = "Kitchen";
const route = useRoute();
const shopId = route.params.shopId;
const tickets = ref([]);

async function load() {
  const { data } = await api.get(`/shops/${shopId}/kds`, {
    params: { station },
  });
  tickets.value = data || [];
}

async function mutate(id, action) {
  await api.patch(`/kds/${id}/${action}`);
  await load();
}

onMounted(load);
</script>

<style scoped>
.kds { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.board { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; }
.card { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:12px; }
.card.ready { border-color:#4ade80; }
.card.inProgress { border-color:#facc15; }
.card.red { box-shadow:0 0 10px rgba(248,113,113,.6); }
.card.yellow { box-shadow:0 0 10px rgba(250,204,21,.5); }
.actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
.btn { background:#3b82f6; border:none; border-radius:6px; padding:6px 10px; color:#fff; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.muted { color:#7b869f; }
</style>
