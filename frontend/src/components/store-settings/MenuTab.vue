<template>
  <div>
    <h3>メニュー設定</h3>
    <p class="sub">※ 既存 /api/menu のエンドポイントに合わせた最小UI</p>
    <div class="ops">
      <input v-model="f.name" placeholder="商品名" />
      <input v-model.number="f.price" type="number" min="0" placeholder="価格" />
      <button class="btn" @click="create">追加</button>
    </div>
    <ul class="list">
      <li v-for="m in rows" :key="m._id" class="row">
        <div><div class="ttl">{{ m.name }}</div><div class="sub">¥{{ m.price }}</div></div>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";
const rows = ref([]); const f = ref({ name:"", price:0 });
async function load(){ const {data}=await api.get("/menu"); rows.value=data; }
async function create(){ await api.post("/menu", f.value); f.value={ name:"", price:0 }; await load(); }
onMounted(load);
</script>
