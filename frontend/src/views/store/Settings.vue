<template>
  <section class="page">
    <h2>設定</h2>
    <div class="tabs">
      <button v-for="t in tabs" :key="t.key" :class="['tab',{active:tab===t.key}]" @click="tab=t.key">{{ t.label }}</button>
    </div>
    <div class="panel">
      <component :is="currentComp" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import StaffTab from "@/components/store-settings/StaffTab.vue";
import StoreDetailTab from "@/components/store-settings/StoreDetailTab.vue";
import MonitorTab from "@/components/store-settings/MonitorTab.vue";
import MenuTab from "@/components/store-settings/MenuTab.vue";
import RegisterTab from "@/components/store-settings/RegisterTab.vue";
import MobileOrderTab from "@/components/store-settings/MobileOrderTab.vue";
import TableTab from "@/components/store-settings/TableTab.vue";

const tabs = [
  { key:"staff", label:"スタッフ管理", comp:StaffTab },
  { key:"detail", label:"店舗詳細情報", comp:StoreDetailTab },
  { key:"monitor", label:"キッチン(ホール)モニター設定", comp:MonitorTab },
  { key:"menu", label:"メニュー設定", comp:MenuTab },
  { key:"register", label:"レジ設定", comp:RegisterTab },
  { key:"mobile", label:"モバイルオーダー設定", comp:MobileOrderTab },
  { key:"table", label:"テーブル設定", comp:TableTab },
];

const tab = ref("staff");
const currentComp = computed(()=> tabs.find(x=>x.key===tab.value)?.comp || StaffTab);
</script>

<style scoped>
.page{ padding:16px; }
.tabs{ display:flex; gap:8px; margin:8px 0 12px; flex-wrap:wrap; }
.tab{ padding:8px 12px; border:1px solid #2a3140; border-radius:999px; background:#0b111a; color:#e8edf3; cursor:pointer }
.tab.active{ background:#e8edf3; color:#0b111a }
.panel{ background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:12px; }
</style>
