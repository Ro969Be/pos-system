<template>
  <header class="app-header" v-if="variant !== 'none'">
    <div class="left">
      <!-- ハンバーガー：<1080pxで表示 -->
      <button class="icon-btn burger" @click="toggleSidebar()" aria-label="open menu">☰</button>
      <router-link to="/public/shops" class="brand">POS Portal</router-link>

      <!-- ルートにより出し分け可能な検索 -->
      <div v-if="showSearch" class="search">
        <label class="sr-only" for="global-search-input">検索</label>
        <input id="global-search-input" placeholder="キーワードで検索" />
        <button class="search-btn" aria-label="検索">検索</button>
      </div>
    </div>

    <nav class="right">
      <!-- 注文履歴 -->
      <router-link
        v-if="showOrdersLink || actions.includes('orders')"
        to="/orders"
        class="hd-link"
      >注文履歴</router-link>

      <!-- カート（ドロップダウン要約） -->
      <div v-if="showCart || actions.includes('cart')" class="cart-wrap">
        <button class="cart-chip" @click="toggleCartDropdown" aria-haspopup="dialog" :aria-expanded="String(showCartDropdown)">
          <span class="icon" aria-hidden="true">🛒</span>
          <span class="count">{{ cartCount }}</span>
          <span class="total">¥{{ cartTotal.toLocaleString() }}</span>
        </button>
        <div v-if="showCartDropdown" class="cart-dd" role="dialog" aria-label="カート概要">
          <div class="row">
            <div>商品数</div><div class="val">{{ cartCount }}点</div>
          </div>
          <div class="row">
            <div>合計金額</div><div class="val">¥{{ cartTotal.toLocaleString() }}</div>
          </div>
          <div class="actions">
            <router-link to="/cart" class="ghost">カートを見る</router-link>
            <router-link to="/checkout" class="primary">購入に進む</router-link>
          </div>
        </div>
      </div>

      <!-- 既存：店舗ログイン導線 -->
      <router-link to="/store/login" class="hd-link">店舗様はこちら</router-link>

      <!-- ユーザメニュー（既存実装を維持） -->
      <div class="user-dd">
        <button class="user-chip" @click="open = !open">
          <span class="avatar">👤</span>
          <span>{{ auth.user?.name ?? 'ゲスト' }}</span>
        </button>
        <div v-if="open" class="dd">
          <router-link to="/login" class="dd-item">サインイン</router-link>
          <router-link to="/register" class="dd-item">新規登録</router-link>
        </div>
      </div>

      <!-- 追加のアクション（ルートmetaで切替） -->
      <button v-if="actions.includes('checkout')" class="btn primary" @click="$router.push('/checkout')">購入に進む</button>
      <button v-if="actions.includes('support')" class="btn" @click="goSupport">サポート</button>
    </nav>
  </header>

  <!-- 注文履歴タブ：orders系ルートでのみ表示 -->
  <nav v-if="ordersTabs" class="orders-tabs" aria-label="注文履歴タブ">
    <RouterLink to="/orders" class="tab" active-class="is-active" exact-active-class="is-active">注文</RouterLink>
    <RouterLink to="/orders/buy-again" class="tab" active-class="is-active" exact-active-class="is-active">再び購入</RouterLink>
    <RouterLink to="/orders/not-shipped" class="tab" active-class="is-active" exact-active-class="is-active">未発送</RouterLink>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { ui, toggleSidebar } from "@/lib/ui";
import * as auth from "@/lib/auth";

const route = useRoute();

// ルート毎の表示切替：meta.header を参照（無指定はデフォルト挙動）
const metaHeader = computed(() => route.meta?.header ?? {});
const showSearch   = computed(() => metaHeader.value.showSearch   ?? true);
const showCart     = computed(() => metaHeader.value.showCart     ?? true);
const showOrdersLink = computed(() => metaHeader.value.showOrdersLink ?? true);
const variant      = computed(() => metaHeader.value.variant      ?? "default"); // default / compact / none
const actions      = computed(() => metaHeader.value.actions      ?? ["orders","cart"]);
const ordersTabs   = computed(() => metaHeader.value.ordersTabs   ?? false);

// ダミーのカート合計（ストア接続前提で後差替）
const cartCount = computed(() => 3);
const cartTotal = computed(() => 5980);

// ドロップダウン
const showCartDropdown = ref(false);
function toggleCartDropdown(){ showCartDropdown.value = !showCartDropdown.value; }
function onDocClick(e){
  const el = document.querySelector(".cart-wrap");
  if (el && !el.contains(e.target)) showCartDropdown.value = false;
}
onMounted(()=> document.addEventListener("click", onDocClick));
onBeforeUnmount(()=> document.removeEventListener("click", onDocClick));

const open = ref(false);

function goSupport(){ /* 実装箇所に合わせて遷移 */ }
</script>

<style src="@/styles/components/header.css"></style>

<style scoped>
/* 小さなアクセシビリティ補助 */
.sr-only{ position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }

/* 検索 */
.search { display:flex; align-items:center; gap:8px; margin-left:12px; }
.search input { min-width: 260px; padding:8px 10px; border:1px solid #ddd; border-radius:6px; }
.search-btn{ padding:8px 10px; border:1px solid #ddd; background:#f7f7f7; border-radius:6px; cursor:pointer; }

/* ヘッダー右側 */
.right{ display:flex; align-items:center; gap:12px; }
.hd-link{ text-decoration: underline; }

/* カート */
.cart-wrap{ position: relative; }
.cart-chip{
  display:flex; align-items:center; gap:6px; cursor:pointer;
  background:#fff; border:1px solid #ddd; border-radius:999px; padding:6px 10px;
}
.cart-chip .icon{ font-size:16px; }
.cart-chip .count{ font-weight:700; }
.cart-chip .total{ font-variant-numeric: tabular-nums; }
.cart-dd{
  position:absolute; right:0; top:calc(100% + 8px);
  width:280px; background:#fff; border:1px solid #e5e5e5; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,.08);
  padding:12px; z-index:50;
}
.cart-dd .row{ display:flex; justify-content:space-between; padding:4px 0; font-size:14px; }
.cart-dd .val{ font-weight:700; }
.cart-dd .actions{ display:flex; gap:8px; margin-top:10px; }
.cart-dd .ghost, .cart-dd .primary{
  flex:1; display:inline-block; text-align:center; padding:8px 10px; border-radius:8px; text-decoration:none;
}
.cart-dd .ghost{ border:1px solid #ddd; background:#fff; color:inherit; }
.cart-dd .primary{ border:none; background:#222; color:#fff; font-weight:700; }

/* 注文タブ */
.orders-tabs{ display:flex; gap:16px; padding:8px 16px; border-bottom:1px solid #eee; background:#fff; }
.tab{ padding:8px 2px; text-decoration:none; color:inherit; }
.is-active{ font-weight:800; border-bottom:2px solid #222; }

/* レスポンシブ */
@media (max-width: 640px){
  .search input{ min-width: 160px; }
}
</style>
