<template>
  <section class="page shops">
    <h2>サロン一覧</h2>
    <p class="sub">Hot Pepper Beauty風カードで表示（ダミー）</p>

    <!-- タブ -->
    <ShopTabs />

    <!-- フィルタ -->
    <div class="filters">
      <input v-model="kw" class="inp" placeholder="店名・エリア・駅を検索" />
      <!-- <SearchBar
        v-model="kw"
        :showScope="false"
        placeholder="店名・エリア・駅を検索"
        size="compact"
        @submit="/* 必要なら */()=>{}"
      /> -->
      <select v-model="sortKey" class="sel">
        <option value="std">標準</option>
        <option value="rank">ランキング</option>
        <option value="new">新着</option>
      </select>
    </div>
      

    <div class="salon-wrap">
      <div class="toggles">
        <label><input type="radio" value="ladies" v-model="g" /> レディース</label>
        <label><input type="radio" value="men" v-model="g" /> メンズ</label>
      </div>
      <div class="grid salon">
        <div v-for="s in filteredSalon" :key="s.id" class="card link" @click="openDetail(s.id)">
          <img :src="s.image" class="thumb" />
          <div class="name">{{ s.name }}</div>
          <div class="meta">
            <span>評価 {{ s.rating.toFixed(1) }}</span>
            <span>最寄り {{ s.station }}</span>
            <span>ジャンル {{ s.genre }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import ShopTabs from '@/components/common/ShopTabs.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const kw = ref('');          // 検索
const sortKey = ref('std');  // 並び替え
const g = ref('ladies');     // サロン表示トグル

const salonList = [
  {id:'s1', name:'Salon Grace', rating:4.5, station:'新宿',   genre:'ヘアサロン',   gender:'ladies', image:'/img/no-image.png'},
  {id:'s2', name:"MEN'S CUT X", rating:4.2, station:'渋谷',   genre:'メンズカット', gender:'men',    image:'/img/no-image.png'},
  {id:'s3', name:'Nail & Lash',  rating:4.1, station:'表参道', genre:'ネイル・まつげ', gender:'ladies', image:'/img/no-image.png'},
];

const filteredSalon = computed(()=>{
  let arr = salonList.filter(x=> x.gender===g.value);
  const k = kw.value.trim();
  if (k) arr = arr.filter(s=> [s.name, s.station, s.genre].some(x=> String(x).includes(k)));
  if (sortKey.value==='rank') arr = [...arr].sort((a,b)=> b.rating-a.rating);
  if (sortKey.value==='new')  arr = [...arr].reverse();
  return arr;
});

const openDetail = (id)=> router.push(`/public/shops/${id}`);
</script>


<style src="@/styles/pages/Shops.css"></style>
