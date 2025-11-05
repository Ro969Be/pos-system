<template>
  <section class="page shops webshops">
    <h2>商品一覧</h2>
    <p class="sub">検索して一覧を表示（ダミー）</p>

    <ShopTabs />

    <!-- Amazon風 中央巨大検索バー -->
    <WebSearchBar
      :categories="categories"
      :source="webList"
      placeholder="キーワードで検索（例：コーヒー豆、マグ、ミル）"
      @search="onSearch"
    />
    <div class="filters">
      <!-- <input v-model="kw" class="inp" placeholder="店名・エリア・駅を検索" /> -->
      <select v-model="sortKey" class="sel">
        <option value="std">標準</option>
        <option value="rank">ランキング</option>
        <option value="review">口コミ順</option>
      </select>
    </div>
    

    <div class="webshops-toolbar">
      <div class="hit">該当：<strong>{{ filtered.length }}</strong> 点</div>
      <select v-model="sortKey" class="sel">
        <option value="std">並び替え：おすすめ</option>
        <option value="priceAsc">価格の安い順</option>
        <option value="priceDesc">価格の高い順</option>
        <option value="new">新着</option>
      </select>
    </div>

    <!-- 一覧 -->
    <div class="grid web">
      <div v-for="p in filtered" :key="p.id" class="card">
        <img :src="p.image" alt="" class="thumb" />
        <div class="title two-line">{{ p.title }}</div>
        <div class="price">¥{{ p.price.toLocaleString() }}</div>
        <div class="rating" v-if="p.rating">⭐ {{ p.rating }}（{{ p.reviews }}件）</div>
        <div class="badges"><span v-if="p.stock<=3" class="tag warn">在庫わずか</span><span v-if="p.fast" class="tag">お急ぎ便</span></div>
        <div class="meta">
          <span class="shop">{{ p.shop }}</span>
          <span class="tag" v-if="p.prime">Prime</span>
        </div>
        <button class="btn" @click="addCart(p)">カートに追加</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ShopTabs from '@/components/common/ShopTabs.vue';
import WebSearchBar from '@/components/WebSearchBar.vue';
// import SearchBar from '@/components/common/SearchBar.vue'
import { add as addToCart } from '@/lib/cart';

const sortKey = ref('std');
const queryState = ref({ q: '', category: '' });

const categories = ['コーヒー', 'マグ', '器具'];

const webList = [
  {id:'w1', title:'ドリップコーヒー豆 500g', price:1580, image:'/img/no-image.png', shop:'A店', category:'コーヒー', prime:true},
  {id:'w2', title:'耐熱マグ 2個セット',     price:1290, image:'/img/no-image.png', shop:'B店', category:'マグ', prime:false},
  {id:'w3', title:'電動ミル',               price:3980, image:'/img/no-image.png', shop:'C店', category:'器具', prime:true},
  {id:'w4', title:'カフェラテ用コーヒー豆 1kg', price:2980, image:'/img/no-image.png', shop:'D店', category:'コーヒー', prime:false},
  {id:'w5', title:'ダブルウォール マグ 350ml', price:1890, image:'/img/no-image.png', shop:'E店', category:'マグ', prime:true},
];

const onSearch = (payload)=>{
  queryState.value = payload;
};

const filtered = computed(()=>{
  const { q, category } = queryState.value;
  let arr = webList.filter(p=>{
    const okCat = !category || p.category === category;
    const okQ = !q || p.title.toLowerCase().includes(q.toLowerCase());
    return okCat && okQ;
  });
  if (sortKey.value==='priceAsc') arr = [...arr].sort((a,b)=> a.price-b.price);
  if (sortKey.value==='priceDesc') arr = [...arr].sort((a,b)=> b.price-a.price);
  if (sortKey.value==='new') arr = [...arr].reverse();
  return arr;
});

const addCart = (p)=> addToCart({ id:p.id, title:p.title, price:p.price, image:p.image, shopName:p.shop });
</script>


<style src="@/styles/pages/Shops.css"></style>
<style src="@/styles/pages/WebShops.css"></style>
