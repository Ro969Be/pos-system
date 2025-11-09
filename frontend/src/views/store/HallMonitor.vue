<template>
  <section class="page hmon">
    <div class="hmon-header">
      <h2>ホールモニター</h2>
      <div class="hmon-actions">
        <button class="btn ghost" @click="reload">再読み込み</button>
      </div>
    </div>

    <div class="board table-group-board">
      <div class="col">
        <h3>配膳待ち</h3>
        <div class="groups">
          <div v-for="(group, t) in groupedReady" :key="'r_'+t" class="table-group">
            <div class="table-head">Table {{ t }}</div>
            <div class="cards">
              <div v-for="it in group" :key="it._id" class="card" :class="it.alert">
                <div class="meta">
                  <span class="badge">#{{ it.orderId?.slice(-6) }}</span>
                  <span class="time">{{ timeFrom(it.timestamps?.createdAt) }}</span>
                  <span v-if="it.alert!=='none'" class="alert">⚠ {{ it.alert }}</span>
                </div>
                <div class="item-name">・{{ it.name }}</div>
                <div class="ops">
                  <!-- ✅ 配膳操作はホールのみ -->
                  <button class="btn xs" @click="serve(it)">配膳済みにする</button>
                  <!-- ✅ READY→READY は無意味なので削除、READY→PENDING のみ提供 -->
                  <button class="btn xs danger" @click="rollbackTo(it,'PENDING')">未調理に戻す</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col">
        <h3>配膳済み（最近）</h3>
        <div class="cards">
          <div v-for="t in servedRecent" :key="t._id" class="card">
            <div class="meta">
              <span class="badge">#{{ t.orderId?.slice(-6) }}</span>
              <span class="time">{{ timeFrom(t.timestamps?.createdAt) }}</span>
            </div>
            <div class="item-name">・{{ t.name }}</div>
            <div class="ops">
              <!-- ✅ 戻しはホールのみ：SERVED→READY / PENDING -->
              <button class="btn xs ghost" @click="rollbackTo(t,'READY')">未配膳に戻す</button>
              <button class="btn xs danger" @click="rollbackTo(t,'PENDING')">未調理に戻す</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/lib/api";
import { useSocket } from "@/lib/socket";
import { currentUser } from "@/lib/auth";

const tickets = ref([]);

function timeFrom(ts){
  if (!ts) return "-";
  const d = new Date(ts); return d.toTimeString().slice(0,5);
}

async function reload(){
  const { data } = await api.get("/api/tickets?role=hall");
  tickets.value = data || [];
}
async function serve(t){
  await api.post(`/api/tickets/${t._id}/status`, { action: "serve" });
  await reload();
}
async function rollbackTo(t, to){
  await api.post(`/api/tickets/${t._id}/status`, { action: "rollback", to });
  await reload();
}

const ready  = computed(()=> tickets.value.filter(t => t.status==="READY"));
const served = computed(()=> tickets.value.filter(t => t.status==="SERVED"));
const servedRecent = computed(()=> served.value.slice(-20).reverse());

function groupByTable(items){
  const map = {};
  for (const it of items) {
    const key = it.tableId ?? "-";
    (map[key] ||= []).push(it);
  }
  return map;
}
const groupedReady = computed(()=> groupByTable(ready.value));

onMounted(async ()=>{
  await reload();
  const sock = useSocket();
  sock.emit("joinStore", currentUser.value?.store?.id);
  sock.on("ticket:created", () => reload());
  sock.on("ticket:updated", () => reload());
});
</script>

<style src="../../styles/pages/HallMonitor.css"></style>
