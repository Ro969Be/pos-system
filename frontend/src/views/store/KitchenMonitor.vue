<template>
  <section class="page kmon">
    <div class="kmon-header">
      <h2>キッチンモニター</h2>
      <div class="kmon-actions">
        <div class="view-toggle">
          <label><input type="radio" value="time" v-model="viewMode" @change="persistViewMode" /> 時間順</label>
          <label><input type="radio" value="table" v-model="viewMode" @change="persistViewMode" /> テーブル別</label>
        </div>
        <button class="btn ghost" @click="reload">再読み込み</button>
      </div>
    </div>

    <div class="filterbar">
      <div class="filter-controls">
        <label v-for="c in categories" :key="c" class="check">
          <input type="checkbox" v-model="categoryMap[c]" @change="persistFilter"/>
          <span>{{ c }}</span>
        </label>
      </div>
      <div class="filter-ops">
        <button class="btn xs" @click="selectAll(true)">全選択</button>
        <button class="btn xs" @click="selectAll(false)">全解除</button>
      </div>
    </div>

    <div v-if="viewMode==='time'" class="board">
      <div class="col">
        <h3>未着手/調理中</h3>
        <div class="cards">
          <div v-for="t in working" :key="t._id" class="card" :class="t.alert">
            <div class="meta">
              <span class="badge">#{{ t.orderId?.slice(-6) }}</span>
              <span class="table">Table {{ t.tableId ?? '-' }}</span>
              <span class="time">{{ timeFrom(t.timestamps?.createdAt) }}</span>
              <span v-if="t.alert!=='none'" class="alert">⚠ {{ t.alert }}</span>
            </div>
            <div class="item-name">・{{ t.name }}</div>
            <div class="ops">
              <!-- ✅ Kitchen は start / ready のみ -->
              <button class="btn xs" @click="mark(t, t.status==='PENDING'?'start':'ready')">
                {{ t.status==='PENDING' ? '着手' : '調理済み' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col">
        <h3>配膳待ち</h3>
        <div class="cards">
          <div v-for="t in ready" :key="t._id" class="card ready" :class="t.alert">
            <div class="meta">
              <span class="badge">#{{ t.orderId?.slice(-6) }}</span>
              <span class="table">Table {{ t.tableId ?? '-' }}</span>
              <span class="time">{{ timeFrom(t.timestamps?.createdAt) }}</span>
              <span v-if="t.alert!=='none'" class="alert">⚠ {{ t.alert }}</span>
            </div>
            <div class="item-name">・{{ t.name }}</div>
            <button class="btn xs danger" @click="rollbackTo(t,'PENDING')">未調理に戻す</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import api from "@/lib/api";
import { useSocket } from "@/lib/socket";

const VIEW_KEY = "pos_kitchen_view_mode";
const FILTER_KEY = "pos_filter_kitchen";
const viewMode = ref(localStorage.getItem(VIEW_KEY) || "time");
const persistViewMode = () => localStorage.setItem(VIEW_KEY, viewMode.value);

const tickets = ref([]);
const categories = ref(["food","drink","dessert","default"]);
const categoryMap = ref(Object.fromEntries(categories.value.map(c => [c, true])));

function persistFilter(){ localStorage.setItem(FILTER_KEY, JSON.stringify(categoryMap.value)); }
function selectAll(b){ for (const k in categoryMap.value) categoryMap.value[k] = b; persistFilter(); }

function timeFrom(ts){
  if (!ts) return "-";
  const d = new Date(ts); return d.toTimeString().slice(0,5);
}

async function reload(){
  const { data } = await api.get("/api/tickets?role=kitchen");
  tickets.value = data || [];
  // カテゴリ一覧を更新
  const set = new Set(categories.value);
  for (const t of tickets.value) set.add(t.category || "default");
  categories.value = Array.from(set);
  const saved = localStorage.getItem(FILTER_KEY);
  if (saved) Object.assign(categoryMap.value, JSON.parse(saved));
}

async function mark(t, action){
  await api.post(`/api/tickets/${t._id}/status`, { action });
  await reload(); // Socketでも更新されるが即時UXのため
}

const filtered = computed(()=> tickets.value.filter(t => (categoryMap.value[t.category] ?? true)));
const working = computed(()=> filtered.value.filter(t => ["PENDING","COOKING"].includes(t.status)));
const ready    = computed(()=> filtered.value.filter(t => t.status==="READY"));

onMounted(async ()=>{
  await reload();
  const sock = useSocket();
  sock.emit("joinStore", import.meta.env.VITE_DEV_STORE_ID);
  sock.on("ticket:created", () => reload());
  sock.on("ticket:updated", () => reload());
});

async function rollbackTo(t, to){
  await api.post(`/api/tickets/${t._id}/status`, { action: "rollback", to });
  await reload();
}
</script>

<style src="../../styles/pages/KitchenMonitor.css"></style>
