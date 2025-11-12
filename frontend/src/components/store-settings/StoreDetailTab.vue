<template>
  <div>
    <h3>店舗詳細</h3>
    <div class="grid">
      <label>種別<select v-model="form.type"><option value="restaurant">飲食店</option><option value="salon">サロン</option><option value="webshop">WEB店舗</option></select></label>
      <label>店名<input v-model="form.name" /></label>
      <label>TEL<input v-model="form.phone" /></label>
      <label>住所<input v-model="form.address" /></label>
      <label>営業日の切替(時)<input v-model.number="form.serviceStartHour" type="number" min="0" max="23" /></label>
    </div>
    <div class="ops"><button class="btn" @click="save">保存</button></div>
    <p v-if="msg" class="ok">{{ msg }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";
const form = ref({ type:"restaurant", name:"", phone:"", address:"", serviceStartHour:0 });
const msg = ref("");

async function load(){ const {data}=await api.get("/storeconfig/store"); if(data){ form.value={
  type:data.type||"restaurant", name:data.name||"", phone:data.phone||"", address:data.address||"",
  serviceStartHour: data.settings?.serviceStartHour ?? 0
};}}
async function save(){ await api.patch("/storeconfig/store", form.value); msg.value="保存しました"; setTimeout(()=>msg.value="",1500); }
onMounted(load);
</script>
