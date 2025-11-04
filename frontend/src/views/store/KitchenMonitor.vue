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
        <button class="btn danger" @click="reset">初期データに戻す</button>
      </div>
    </div>

    <!-- Kitchen 専用カテゴリフィルタ -->
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

    <!-- ===== 時間順表示 ===== -->
    <div v-if="viewMode==='time'" class="board">
      <div class="col">
        <h3>未着手</h3>
        <div class="cards">
          <div v-for="it in pendingItems" :key="it.key" class="card" :class="{ late: isLate(it.order) }">
            <div class="meta">
              <span class="badge">#{{ it.order.id }}</span>
              <span class="table">Table {{ it.order.table }}</span>
              <span class="time">{{ timeFrom(it.order.createdAt) }}</span>
              <span v-if="isLate(it.order)" class="alert">⚠ 遅延</span>
            </div>
            <div class="item-name">・{{ it.item.name }}</div>
            <div class="ops">
              <button class="btn primary" @click="toCooking(it)">着手（調理中へ）</button>
              <button class="btn danger" @click="cancel(it)">キャンセル</button>
            </div>
          </div>
        </div>
      </div>

      <div class="col">
        <h3>調理中</h3>
        <div class="cards">
          <div v-for="it in cookingItems" :key="it.key" class="card" :class="{ late: isLate(it.order) }">
            <div class="meta">
              <span class="badge">#{{ it.order.id }}</span>
              <span class="table">Table {{ it.order.table }}</span>
              <span class="time">{{ timeFrom(it.order.createdAt) }}</span>
              <span v-if="isLate(it.order)" class="alert">⚠ 遅延</span>
            </div>
            <div class="item-name">・{{ it.item.name }}</div>
            <div class="ops">
              <button class="btn primary" @click="toReady(it)">調理済み</button>
              <button class="btn ghost" @click="toPending(it)">戻す</button>
              <button class="btn danger" @click="cancel(it)">キャンセル</button>
            </div>
          </div>
        </div>
      </div>

      <div class="col">
        <h3>調理済み（配膳待ち）</h3>
        <div class="cards">
          <div v-for="it in readyItems" :key="it.key" class="card" :class="{ late: isLate(it.order) }">
            <div class="meta">
              <span class="badge">#{{ it.order.id }}</span>
              <span class="table">Table {{ it.order.table }}</span>
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

    <!-- ===== テーブル別表示 ===== -->
    <div v-else class="board table-group-board">
      <div class="col">
        <h3>未着手</h3>
        <div class="groups">
          <div v-for="(group, t) in groupedByTable.pending" :key="'p_'+t" class="table-group">
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
                  <button class="btn primary" @click="toCooking(it)">着手（調理中へ）</button>
                  <button class="btn danger" @click="cancel(it)">キャンセル</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col">
        <h3>調理中</h3>
        <div class="groups">
          <div v-for="(group, t) in groupedByTable.cooking" :key="'c_'+t" class="table-group">
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
                  <button class="btn primary" @click="toReady(it)">調理済み</button>
                  <button class="btn ghost" @click="toPending(it)">戻す</button>
                  <button class="btn danger" @click="cancel(it)">キャンセル</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col">
        <h3>調理済み（配膳待ち）</h3>
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

/* ===== Kitchen専用 表示モード保存 ===== */
const VIEW_KEY = "pos_kitchen_view_mode"; // 'time' | 'table'
const viewMode = ref(localStorage.getItem(VIEW_KEY) || "time");
const persistViewMode = () => localStorage.setItem(VIEW_KEY, viewMode.value);

/* ===== カテゴリフィルタ（Kitchen専用） ===== */
const categories = ref(getAllCategories());
const categoryMap = reactive({});
function initFilterMap(){
  const saved = loadCategoryFilter("kitchen");
  for (const c of categories.value) categoryMap[c] = saved?.[c] ?? true;
}
function persistFilter(){
  const out = {}; for (const c of categories.value) out[c] = !!categoryMap[c];
  saveCategoryFilter("kitchen", out);
}
function selectAll(v){ for(const c of categories.value) categoryMap[c]=!!v; persistFilter(); }

/* ===== 共通 util ===== */
function isLate(order){
  const passedMin = Math.floor((Date.now()-order.createdAt)/60000);
  return passedMin > (order.slaMin || 15);
}
function timeFrom(ts){
  const d = new Date(ts);
  return d.toTimeString().slice(0,5); // HH:MM
}

/* ===== item をフラット化（カテゴリ適用） ===== */
const flatItems = computed(()=>{
  const arr=[];
  for(const o of list.value){
    (o.items||[]).forEach((it,idx)=>{
      const cat = it.category || "未分類";
      if (categoryMap[cat] ?? true){
        arr.push({ key:`${o.id}_${idx}`, order:o, item:it, orderId:o.id, itemIndex:idx });
      }
    });
  }
  // 時間順の安定ソート（createdAt 昇順）
  return arr.sort((a,b)=> a.order.createdAt - b.order.createdAt);
});

const pendingItems = computed(()=> flatItems.value.filter(x=>x.item.status==='pending'));
const cookingItems = computed(()=> flatItems.value.filter(x=>x.item.status==='cooking'));
const readyItems   = computed(()=> flatItems.value.filter(x=>x.item.status==='ready'));

/* ===== テーブル別グループ ===== */
function groupByTable(items){
  const map = {};
  for(const it of items){
    const t = it.order.table || "-";
    (map[t] ||= []).push(it);
  }
  // テーブル番号順ソート（A1, A2, B1… のような文字列でもOKな単純昇順）
  return Object.fromEntries(Object.entries(map).sort(([a],[b])=> a.localeCompare(b,'ja')));
}
const groupedByTable = computed(()=> ({
  pending: groupByTable(pendingItems.value),
  cooking: groupByTable(cookingItems.value),
  ready:   groupByTable(readyItems.value),
}));

/* ===== 状態遷移 ===== */
function toPending(x){ updateItem(x.orderId,x.itemIndex, it=>it.status='pending');  reload(); }
function toCooking(x){ updateItem(x.orderId,x.itemIndex, it=>it.status='cooking');  reload(); }
function toReady(x){   updateItem(x.orderId,x.itemIndex, it=>it.status='ready');    reload(); }
function toServed(x){  updateItem(x.orderId,x.itemIndex, it=>it.status='served');   reload(); }
function cancel(x){    updateItem(x.orderId,x.itemIndex, it=>it.status='canceled'); reload(); }

/* ===== 同期 ===== */
function reload(){ list.value = loadOrders(); }
function reset(){
  resetOrders(); reload();
  categories.value = getAllCategories();
  initFilterMap();
}
let t; onMounted(()=>{ initFilterMap(); t=setInterval(reload,1000); });
onUnmounted(()=> clearInterval(t));
</script>

<style src="../../styles/pages/KitchenMonitor.css"></style>
