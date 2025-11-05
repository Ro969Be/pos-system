<template>
  <section class="page shops">
    <h2>店舗一覧</h2>
    <p class="sub">カテゴリを選択して一覧を表示</p>
    <ShopTabs />
    <div class="tabs is-hidden-for-diff"></div>

    <!-- フィルタ -->
    <div class="filters">
      <input v-model="kw" class="inp" placeholder="店名・エリア・駅を検索" />
      <select v-model="sortKey" class="sel">
        <option value="std">標準</option>
        <option value="rank">ランキング</option>
        <option value="review">口コミ順</option>
        <option value="new">ニューオープン</option>
      </select>
      <!-- <SearchBar
        v-model="kw"
        :showScope="false"
        placeholder="店名・エリア・駅を検索"
        size="compact"
        @submit="/* 必要なら */()=>{}"
        theme="plain"
      /> -->
    </div>

    <!-- 飲食店（食べログ風） -->
    <div class="grid food">
      <div v-for="s in filteredFood" :key="s.id" class="card link" @click="openDetail(s.id)">
        <img :src="s.image" class="thumb" />
        <div class="name">{{ s.name }}</div>
        <div class="meta">
          <span>評価 {{ s.rating.toFixed(1) }}</span>
          <span>最寄り {{ s.station }}</span>
          <span>ジャンル {{ s.genre }}</span>
        </div>
        <div class="budget">昼 ¥{{ s.lunch.toLocaleString() }} / 夜 ¥{{ s.dinner.toLocaleString() }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import ShopTabs from '@/components/common/ShopTabs.vue'
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const kw = ref('');
const sortKey = ref('std');

// --- 飲食（食べログ風） ---
const foodList = [
  {id:'f1', name:'居酒屋 大将',    rating:4.0, station:'新宿',   genre:'居酒屋', lunch:1200, dinner:3500, image:'/img/shop1.jpg'},
  {id:'f2', name:'Bar Stella',     rating:4.3, station:'渋谷',   genre:'バー',   lunch:0,    dinner:4000, image:'/img/shop2.jpg'},
  {id:'f3', name:'カフェ Lumière', rating:4.1, station:'代々木', genre:'カフェ', lunch:1000, dinner:2000, image:'/img/shop3.jpg'},
];

const filteredFood = computed(()=>{
  let arr = foodList.filter(s=>{
    const k = kw.value.trim();
    return !k || [s.name, s.station, s.genre].some(x=> String(x).includes(k));
  });
  if (sortKey.value==='rank')   arr = [...arr].sort((a,b)=> b.rating-a.rating);
  if (sortKey.value==='review') arr = [...arr]; // ダミー（将来レビュー件数で）
  if (sortKey.value==='new')    arr = [...arr].reverse(); // ダミー：新着順
  return arr;
});

const openDetail = (id)=> router.push(`/public/shops/${id}`);
</script>

<style scoped>
/* ルータータブを既存の .tabs ボタンに揃える */
.tabs { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.tab-btn {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #2a3140;
  background: #0b111a;
  color: #e8edf3;
  text-decoration: none;
}
.tab-btn.active { background:#e8edf3; color:#0b111a; font-weight:800; }
</style>

<style src="@/styles/pages/Shops.css"></style>
