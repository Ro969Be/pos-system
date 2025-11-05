<template>
  <section class="page shops">
    <h2>店舗一覧</h2>
    <p class="sub">カテゴリを選択して一覧を表示（ダミー表示）</p>

    <!-- カテゴリ選択 -->
    <div class="tabs">
      <button :class="{active: tab==='web'}" @click="tab='web'">ウェブ店舗（Amazon風）</button>
      <button :class="{active: tab==='food'}" @click="tab='food'">飲食店（食べログ風）</button>
      <button :class="{active: tab==='salon'}" @click="tab='salon'">サロン（Hot Pepper Beauty風）</button>
    </div>

    <!-- フィルタ（最小） -->
    <div class="filters" v-if="tab!=='web'">
      <input v-model="kw" class="inp" placeholder="店名・エリア・駅を検索" />
      <select v-model="sortKey" class="sel">
        <option value="std">標準</option>
        <option value="rank">ランキング</option>
        <option value="review">口コミ順</option>
        <option value="new">ニューオープン</option>
      </select>
    </div>

    <!-- 一覧 -->
    <div v-if="tab==='web'" class="grid web">
      <div v-for="p in webList" :key="p.id" class="card">
        <img :src="p.image" alt="" class="thumb" />
        <div class="title">{{ p.title }}</div>
        <div class="price">¥{{ p.price.toLocaleString() }}</div>
        <button class="btn" @click="addCart(p)">カートに追加</button>
      </div>
    </div>

    <div v-else-if="tab==='food'" class="grid food">
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

    <div v-else class="salon-wrap">
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

    <!-- ※ 下部カートの簡易表示ブロックは削除済み（ヘッダーに集約） -->
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { add as addToCart } from "@/lib/cart"; // ヘッダーのカートと連動

const router = useRouter();
const tab = ref("food");     // 既定を「飲食」に
const kw = ref("");          // 検索
const sortKey = ref("std");  // 並び替え
const g = ref("ladies");     // サロン表示トグル

// --- Web（Amazon風） ---
const webList = [
  {id:"w1", title:"ドリップコーヒー豆 500g", price:1580, image:"/img/no-image.png", shop:"A店"},
  {id:"w2", title:"耐熱マグ 2個セット",        price:1290, image:"/img/no-image.png", shop:"B店"},
  {id:"w3", title:"電動ミル",                  price:3980, image:"/img/no-image.png", shop:"C店"},
];
// ヘッダーのカートストアに追加
const addCart = (p) => addToCart({ id:p.id, title:p.title, price:p.price, image:p.image, shopName:p.shop });

// --- 飲食（食べログ風） ---
const foodList = [
  {id:"f1", name:"居酒屋 大将", rating:4.0, station:"新宿", genre:"居酒屋", lunch:1200, dinner:3500, image:"/img/shop1.jpg"},
  {id:"f2", name:"Bar Stella", rating:4.3, station:"渋谷", genre:"バー", lunch:0,    dinner:4000, image:"/img/shop2.jpg"},
  {id:"f3", name:"カフェ Lumière", rating:4.1, station:"代々木", genre:"カフェ", lunch:1000, dinner:2000, image:"/img/shop3.jpg"},
];
const filteredFood = computed(()=>{
  let arr = foodList.filter(s=>{
    const k = kw.value.trim();
    return !k || [s.name,s.station,s.genre].some(x=> String(x).includes(k));
  });
  if(sortKey.value==="rank")   arr = [...arr].sort((a,b)=> b.rating-a.rating);
  if(sortKey.value==="review") arr = [...arr]; // ダミー：将来レビュー件数で
  if(sortKey.value==="new")    arr = [...arr].reverse(); // ダミー：新着順
  return arr;
});

// --- サロン（Hot Pepper Beauty風） ---
const salonList = [
  {id:"s1", name:"Salon Grace",  rating:4.5, station:"新宿",   genre:"ヘアサロン",    gender:"ladies", image:"/img/no-image.png"},
  {id:"s2", name:"MEN'S CUT X",  rating:4.2, station:"渋谷",   genre:"メンズカット",  gender:"men",    image:"/img/no-image.png"},
  {id:"s3", name:"Nail & Lash",  rating:4.1, station:"表参道", genre:"ネイル・まつげ", gender:"ladies", image:"/img/no-image.png"},
];
const filteredSalon = computed(()=>{
  let arr = salonList.filter(x=> x.gender===g.value);
  const k = kw.value.trim();
  if(k) arr = arr.filter(s=> [s.name,s.station,s.genre].some(x=> String(x).includes(k)));
  if(sortKey.value==="rank") arr = [...arr].sort((a,b)=> b.rating-a.rating);
  if(sortKey.value==="new")  arr = [...arr].reverse();
  return arr;
});

const openDetail = (id)=> router.push(`/public/shops/${id}`);
</script>

<style src="@/styles/pages/Shops.css"></style>
