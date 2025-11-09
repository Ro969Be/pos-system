<template>
  <div>
    <h3>モニター設定</h3>
    <details open>
      <summary>カテゴリ</summary>
      <div class="ops">
        <input v-model="catName" placeholder="例: 前菜 / ドリンク / デザート" />
        <button class="btn" @click="addCategory">追加</button>
      </div>
      <ul class="list tight">
        <li v-for="c in categories" :key="c.id" class="row">
          <div class="ttl">{{ c.name }}</div>
          <button class="btn danger" @click="delCategory(c.id)">削除</button>
        </li>
      </ul>
    </details>

    <details open>
      <summary>ステーション（キッチン/ドリンク/ホール）</summary>
      <div class="grid">
        <label>名称<input v-model="st.form.name" /></label>
        <label>役割<select v-model="st.form.role"><option value="kitchen">キッチン</option><option value="drink">ドリンク</option><option value="hall">ホール</option></select></label>
        <label>カテゴリ割当<select multiple v-model="st.form.categories">
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select></label>
        <label>SLA上書き(JSON) <input v-model="st.form.sla" placeholder='{"前菜":10}' /></label>
        <button class="btn" @click="createStation">追加</button>
      </div>
      <ul class="list">
        <li v-for="x in stations" :key="x.id" class="row">
          <div>
            <div class="ttl">{{ x.name }} <small>({{ x.role }})</small></div>
            <div class="sub">カテゴリ: {{ x.categories.length }} / SLA上書き: {{ Object.keys(x.slaOverrideMinutes||{}).length }}</div>
          </div>
          <div class="ops">
            <button class="btn ghost" @click="edit(x)">編集</button>
            <button class="btn danger" @click="delStation(x.id)">削除</button>
          </div>
        </li>
      </ul>
    </details>
    <p v-if="err" class="err">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";

const categories = ref([]); const catName = ref("");
const stations = ref([]); const err = ref("");
const st = ref({ form: { name:"", role:"kitchen", categories:[], sla:"" } });

async function loadCats(){ const {data}=await api.get("/storeconfig/categories"); categories.value=data; }
async function addCategory(){ if(!catName.value) return; await api.post("/storeconfig/categories",{ name:catName.value }); catName.value=""; await loadCats(); }
async function delCategory(id){ if(!confirm("削除しますか？")) return; await api.delete(`/storeconfig/categories/${id}`); await loadCats(); await loadStations(); }

async function loadStations(){ const {data}=await api.get("/storeconfig/stations"); stations.value=data; }
async function createStation(){
  const payload = { ...st.value.form };
  try{ payload.slaOverrideMinutes = JSON.parse(payload.sla || "{}"); }catch{ payload.slaOverrideMinutes = {}; }
  delete payload.sla;
  await api.post("/storeconfig/stations", payload);
  st.value.form = { name:"", role:"kitchen", categories:[], sla:"" };
  await loadStations();
}
async function edit(x){
  const name = prompt("名称", x.name); if(name===null) return;
  await api.patch(`/storeconfig/stations/${x.id}`, { name });
  await loadStations();
}
async function delStation(id){
  if(!confirm("削除しますか？")) return;
  await api.delete(`/storeconfig/stations/${id}`); await loadStations();
}

onMounted(async ()=>{ await loadCats(); await loadStations(); });
</script>
