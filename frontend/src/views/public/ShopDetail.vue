<template>
  <section class="page shop-detail">
    <!-- 上：基本ヘッダー -->
    <div class="head">
      <div class="left">
        <h2>{{ shop.name }}</h2>
        <div class="meta">
          <span>評価 {{ shop.rating.toFixed(1) }}</span>
          <span>最寄り {{ shop.station }}</span>
          <span>ジャンル {{ shop.genre }}</span>
          <span v-if="shop.lunch">昼 ¥{{ shop.lunch.toLocaleString() }}</span>
          <span v-if="shop.dinner">夜 ¥{{ shop.dinner.toLocaleString() }}</span>
          <span>定休日：{{ shop.holiday || '—' }}</span>
        </div>
      </div>
      <div class="right">
        <button class="btn" @click="goReserve">ネット予約</button>
      </div>
    </div>

    <!-- 中央：トップ（写真/紹介/こだわり/コース/投稿写真/口コミ） -->
    <div class="grid">
      <div class="main">
        <div class="hero">
          <img :src="shop.image" class="hero-img" />
          <div class="hero-title">
            <h3>{{ shop.catch || '紹介タイトル（ダミー）' }}</h3>
            <p>{{ shop.desc || '紹介文のダミーテキスト…' }}</p>
          </div>
        </div>

        <div class="tiles">
          <h3>お店のこだわり</h3>
          <div class="tile-grid">
            <div class="tile" v-for="i in 4" :key="i">
              <div class="ph"></div>
              <div class="tt">こだわり見出し {{ i }}</div>
              <div class="tx">テキストのダミー…</div>
            </div>
          </div>
        </div>

        <div class="courses">
          <h3>コース</h3>
          <div class="course-grid">
            <div class="course" v-for="c in 3" :key="c">
              <div class="ph"></div>
              <div class="tag">飲み放題あり</div>
              <div class="nm">コース名サンプル</div>
              <div class="meta">品数 7 / 最低2名 / ¥3,500</div>
              <div class="ops">
                <button class="btn ghost" @click="goReserve">予約する</button>
                <button class="btn">詳細</button>
              </div>
            </div>
          </div>
        </div>

        <div class="photos">
          <h3>投稿写真</h3>
          <div class="photo-grid">
            <div class="ph" v-for="i in 8" :key="i"></div>
          </div>
          <button class="btn ghost sm">もっと見る</button>
        </div>

        <div class="reviews">
          <h3>口コミ</h3>
          <div class="rev" v-for="i in 3" :key="i">
            <div class="who">User {{ i }}</div>
            <div class="tx">口コミ本文のダミー…</div>
          </div>
          <div class="ops">
            <button class="btn sm">投稿する</button>
            <button class="btn ghost sm">もっと見る</button>
          </div>
        </div>
      </div>

      <!-- 右：予約ウィジェット -->
      <aside class="side">
        <h3>ネット予約</h3>
        <label class="field"><span>来店日</span><select class="sel"><option>11/10</option><option>11/11</option></select></label>
        <label class="field"><span>人数</span><select class="sel"><option>2名</option><option>3名</option></select></label>
        <label class="field"><span>時間</span><select class="sel"><option>18:00</option><option>19:00</option></select></label>
        <button class="btn" @click="goReserve">予約する</button>
      </aside>
    </div>

    <!-- 下：基本情報 / 席・設備 / メニュー / 特徴・関連情報 -->
    <div class="sections">
      <div class="sec">
        <h3>基本情報</h3>
        <ul class="kv">
          <li><b>店名</b><span>{{ shop.name }}</span></li>
          <li><b>ジャンル</b><span>{{ shop.genre }}</span></li>
          <li><b>お問い合わせ</b><span>03-0000-0000</span></li>
          <li><b>予約可否</b><span>可</span></li>
          <li><b>住所</b><span>東京都〇〇…（MAP）</span></li>
          <li><b>交通手段</b><span>新宿駅 徒歩5分</span></li>
          <li><b>営業時間</b><span>月-日 11:00-23:00 / 祝・前日 異なる場合あり</span></li>
          <li><b>支払方法</b><span>カード/電子マネー/QR（詳細）</span></li>
        </ul>
      </div>

      <div class="sec">
        <h3>席・設備</h3>
        <ul class="kv">
          <li><b>席数</b><span>48席</span></li>
          <li><b>最大予約人数</b><span>20名</span></li>
          <li><b>個室</b><span>有</span></li>
          <li><b>貸切</b><span>可</span></li>
          <li><b>禁煙・喫煙</b><span>禁煙</span></li>
          <li><b>駐車場</b><span>無</span></li>
          <li><b>空間・設備</b><span>落ち着いた空間 等</span></li>
        </ul>
      </div>

      <div class="sec">
        <h3>メニュー</h3>
        <div class="kv"><li><b>コース</b><span>各種あり</span></li><li><b>ドリンク/料理</b><span>各種</span></li></div>
      </div>

      <div class="sec">
        <h3>特徴・関連情報</h3>
        <ul class="kv">
          <li><b>利用シーン</b><span>デート/会食/女子会 等</span></li>
          <li><b>ロケーション</b><span>駅近/夜景 等</span></li>
          <li><b>サービス</b><span>テイクアウト/デリバリー...</span></li>
          <li><b>お子様連れ</b><span>可</span></li>
          <li><b>公式アカウント</b><span>@official</span></li>
          <li><b>オープン日</b><span>2022-04-01</span></li>
          <li><b>電話番号</b><span>03-0000-0000</span></li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
const route = useRoute(); const router = useRouter();
const id = route.params.id;

// ダミー取得
const map = {
  f1:{id:"f1", name:"居酒屋 大将", rating:4.0, station:"新宿", genre:"居酒屋", lunch:1200, dinner:3500, image:"/img/shop1.jpg"},
  f2:{id:"f2", name:"Bar Stella", rating:4.3, station:"渋谷", genre:"バー", dinner:4000, image:"/img/shop2.jpg"},
  f3:{id:"f3", name:"カフェ Lumière", rating:4.1, station:"代々木", genre:"カフェ", lunch:1000, dinner:2000, image:"/img/shop3.jpg"},
  s1:{id:"s1", name:"Salon Grace", rating:4.5, station:"新宿", genre:"ヘアサロン", image:"/img/no-image.png"},
};
const shop = map[id] || {id, name:"店舗名", rating:4.0, station:"-", genre:"-", image:"/img/no-image.png"};

function goReserve(){ router.push("/public/reservations"); }
</script>

<style src="@/styles/pages/ShopDetail.css"></style>
