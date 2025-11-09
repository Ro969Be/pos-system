<template>
  <div>
    <h3>モバイルオーダー</h3>
    <label><input type="checkbox" v-model="f.enabled" /> 有効化</label>
    <label><input type="checkbox" v-model="f.pickupEnabled" /> 店頭受取</label>
    <label><input type="checkbox" v-model="f.deliveryEnabled" /> デリバリー</label>
    <label>メモ<input v-model="f.note" /></label>
    <div class="ops"><button class="btn" @click="save">保存</button></div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";
const f = ref({ enabled:false, pickupEnabled:false, deliveryEnabled:false, note:"" });
async function load(){ const {data}=await api.get("/storeconfig/mobile-order"); Object.assign(f.value, data); }
async function save(){ await api.patch("/storeconfig/mobile-order", f.value); }
onMounted(load);
</script>
