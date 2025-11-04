<template>
  <section class="page hmon">
    <div class="hmon-header">
      <h2>ホールモニター</h2>
      <div class="hmon-actions">
        <button class="btn ghost" @click="reload">再読み込み</button>
        <button class="btn danger" @click="reset">初期データに戻す</button>
      </div>
    </div>

    <!-- Hall 専用カテゴリフィルタ -->
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

    <div class="board table-group-board">
      <div class="col">
        <h3>配膳待ち</h3>
        <div class="groups">
          <div v-for="(group, t) in groupedByTable.ready" :key="'r_'+t" class="table-group">
            <div class="table-head">Table {{ t }}</div>
            <div class="cards">
              <div v-for="it in group" :key="it.key" class="card" :class="{ late: isLate(it.order) }">
                <div class="meta">
                  <span class="badge">#{{ it.order.id }}</span>
                  <span class="time">{{ timeFrom(it.order.createdAt) }}</span>
                  <span v-if="isLate(it.order)" class="alert">⚠ 遅延</span>
                </div>
                <div class="item-name">・{{ it.item.name }}</div>
                <div class="ops">
                  <button class="btn primary" @click="toServed(it)">配膳済みにする</button>
                  <button class="btn ghost" @click="toCooking(it)">戻す</button>
                  <button class="btn danger" @click="cancel(it)">キャンセル</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col">
        <h3>配膳済み</h3>
        <div class="groups">
          <div v-for="(group, t) in groupedByTable.served" :key="'s_'+t" class="table-group">
            <div class="table-head">Table {{ t }}</div>
            <div class="cards">
              <div v-for="it in group" :key="it.key" class="card">
                <div class="meta">
                  <span class="badge">#{{ it.order.id }}</span>
                  <span class="time">{{ timeFrom(it.order.createdAt) }}</span>
                </div>
                <div class="item-name">・{{ it.item.name }}</div>
                <div class="ops">
                  <button class="btn ghost" @click="toReady(it)">配膳待ちに戻す</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import {
  loadOrders, updateItem, resetOrders,
  getAllCategories, loadCategoryFilter, saveCategoryFilter
} from "@/lib/dummy/orders";

const list = ref(loadOrders());

/* Hall 専用フィルタ */
const categories = ref(getAllCategories());
const categoryMap = reactive({});
function initFilterMap(){
  const saved = loadCategoryFilter("hall");
  for (const c of categories.value) categoryMap[c] = saved?.[c] ?? true;
}
function persistFilter(){
  const out = {}; for (const c of categories.value) out[c] = !!categoryMap[c];
  saveCategoryFilter("hall", out);
}
function selectAll(v){ for(const c of categories.value) categoryMap[c]=!!v; persistFilter(); }

/* 共通 util */
function isLate(order){
  const passedMin = Math.floor((Date.now()-order.createdAt)/60000);
  return passedMin > (order.slaMin || 15);
}
function timeFrom(ts){
  const d = new Date(ts); return d.toTimeString().slice(0,5);
}

/* itemフラット化 + カテゴリ適用 */
const flatItems = computed(()=>{
  const arr=[]; for(const o of list.value){
    (o.items||[]).forEach((it,idx)=>{
      const cat = it.category || "未分類";
      if (categoryMap[cat] ?? true){
        arr.push({ key:`${o.id}_${idx}`, order:o, item:it, orderId:o.id, itemIndex:idx });
      }
    });
  }
  // テーブル枠内の並びは createdAt 昇順で安定
  return arr.sort((a,b)=> a.order.createdAt - b.order.createdAt);
});

const readyItems  = computed(()=> flatItems.value.filter(x=>x.item.status==='ready'));
const servedItems = computed(()=> flatItems.value.filter(x=>x.item.status==='served'));

function groupByTable(items){
  const map={}; for(const it of items){ const t=it.order.table||"-"; (map[t] ||= []).push(it); }
  return Object.fromEntries(Object.entries(map).sort(([a],[b])=> a.localeCompare(b,'ja')));
}
const groupedByTable = computed(()=> ({
  ready:  groupByTable(readyItems.value),
  served: groupByTable(servedItems.value),
}));

/* 状態遷移 */
function toReady(x){   updateItem(x.orderId,x.itemIndex, it=>it.status='ready');   reload(); }
function toCooking(x){ updateItem(x.orderId,x.itemIndex, it=>it.status='cooking'); reload(); }
function toServed(x){  updateItem(x.orderId,x.itemIndex, it=>it.status='served');  reload(); }
function cancel(x){    updateItem(x.orderId,x.itemIndex, it=>it.status='canceled');reload(); }

/* 同期 */
function reload(){ list.value = loadOrders(); }
function reset(){
  resetOrders(); reload();
  categories.value = getAllCategories();
  initFilterMap();
}
let t; onMounted(()=>{ initFilterMap(); t=setInterval(reload,1000); });
onUnmounted(()=> clearInterval(t));
</script>

<style src="../../styles/pages/HallMonitor.css"></style>
