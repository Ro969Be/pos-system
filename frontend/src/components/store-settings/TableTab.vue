<template>
  <div>
    <h3>テーブル設定</h3>
    <div class="ops">
      <input v-model="f.name" placeholder="テーブル名" />
      <input v-model.number="f.capacity" type="number" min="1" placeholder="人数" />
      <button class="btn" @click="create">追加</button>
    </div>
    <ul class="list">
      <li v-for="t in rows" :key="t.id" class="row">
        <div><div class="ttl">{{ t.name }}</div><div class="sub">定員: {{ t.capacity }}</div></div>
        <div class="ops">
          <button class="btn ghost" @click="rename(t)">編集</button>
          <button class="btn danger" @click="del(t.id)">削除</button>
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";
const rows = ref([]); const f = ref({ name:"", capacity:2 });
async function load(){ const {data}=await api.get("/storeconfig/tables"); rows.value = data; }
async function create(){ await api.post("/storeconfig/tables", f.value); f.value={ name:"", capacity:2 }; await load(); }
async function rename(t){ const name=prompt("テーブル名", t.name); if(name===null) return; await api.patch(`/storeconfig/tables/${t.id}`, { name }); await load(); }
async function del(id){ if(!confirm("削除しますか？")) return; await api.delete(`/storeconfig/tables/${id}`); await load(); }
onMounted(load);
</script>
