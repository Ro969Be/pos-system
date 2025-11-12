<template>
  <div>
    <h3>レジ設定</h3>
    <div class="ops">
      <input v-model="f.name" placeholder="レジ名" />
      <input v-model="f.pass" placeholder="PASS" />
      <input v-model="f.printerIP" placeholder="プリンタIP(任意)" />
      <select v-model="f.taxMode"><option value="inclusive">内税</option><option value="exclusive">外税</option></select>
      <button class="btn" @click="create">追加</button>
    </div>
    <ul class="list">
      <li v-for="r in rows" :key="r.id" class="row">
        <div><div class="ttl">{{ r.name }}</div><div class="sub">{{ r.taxMode }} / {{ r.printerIP }}</div></div>
        <div class="ops">
          <button class="btn ghost" @click="rename(r)">編集</button>
          <button class="btn danger" @click="del(r.id)">削除</button>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";
const rows = ref([]); const f = ref({ name:"", pass:"", printerIP:"", taxMode:"inclusive" });
async function load(){ const {data}=await api.get("/storeconfig/registers"); rows.value=data; }
async function create(){ await api.post("/storeconfig/registers", f.value); f.value={ name:"", pass:"", printerIP:"", taxMode:"inclusive" }; await load(); }
async function rename(r){ const name=prompt("レジ名", r.name); if(name===null) return; await api.patch(`/storeconfig/registers/${r.id}`, { name }); await load(); }
async function del(id){ if(!confirm("削除しますか？")) return; await api.delete(`/storeconfig/registers/${id}`); await load(); }
onMounted(load);
</script>
