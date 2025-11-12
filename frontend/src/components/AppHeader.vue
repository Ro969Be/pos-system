<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toggleSidebar } from "@/lib/ui";
import { currentUser, isLoggedIn, logout } from "@/lib/auth";
import { count as cartCount, total as cartTotal } from "@/lib/cart";

const route = useRoute();
const router = useRouter();

const metaHeader = computed(() => route.meta?.header ?? {});
const showCart       = computed(() => metaHeader.value.showCart     ?? true);
const showOrdersLink = computed(() => metaHeader.value.showOrdersLink ?? true);
const variant        = computed(() => metaHeader.value.variant      ?? "default");
const actions        = computed(() => metaHeader.value.actions      ?? ["orders","cart"]);
const ordersTabs     = computed(() => metaHeader.value.ordersTabs   ?? false);

// ユーザー・店舗表示用
const user = currentUser; // ref
const storeLabel = computed(() => user.value?.store ? `(${user.value.store.code})` : "");

// カートDD
const showCartDropdown = ref(false);

function toggleCartDropdown(){
  open.value = false;
  showCartDropdown.value = !showCartDropdown.value;
}

function onDocClick(e){
  const target = e.target;

  // カート
  const cartEl = document.querySelector(".cart-wrap");
  if (cartEl && target && !cartEl.contains(target)) {
    showCartDropdown.value = false;
  }

  // ユーザメニュー
  const userEl = document.querySelector(".user-wrap");
  if (userEl && target && !userEl.contains(target)) {
    open.value = false;
  }
}

onMounted(()=> document.addEventListener("click", onDocClick));
onBeforeUnmount(()=> document.removeEventListener("click", onDocClick));

// ルートが変わったらメニューを閉じる
watch(() => route.fullPath, () => {
  showCartDropdown.value = false;
  open.value = false;
});

// スクロールでも閉じる（誤タップ防止）
onMounted(() => {
  const closeOnScroll = () => { showCartDropdown.value = false; open.value = false; };
  window.addEventListener("scroll", closeOnScroll, { passive: true });
  onBeforeUnmount(() => window.removeEventListener("scroll", closeOnScroll));
});

// ユーザDD
const open = ref(false);
async function doLogout(){
  await logout();
  open.value = false;
  router.push("/public/shops");
}
</script>

<template>
  <header class="app-header" v-if="variant !== 'none'">
    <div class="left">
      <button class="icon-btn burger" @click="toggleSidebar()" aria-label="open menu">☰</button>
      <router-link to="/public/shops" class="brand">POS Portal</router-link>
      <!-- 検索はボディ側へ移動したため、ここには置かない -->
    </div>

    <nav class="right">
      <!-- 注文履歴：SPではアイコン、PCはテキスト -->
      <router-link
        v-if="showOrdersLink || actions.includes('orders')"
        to="/orders"
        class="hd-link order-link"
        aria-label="注文履歴"
        @click="closeCart()"
      >
        <span class="only-icon" aria-hidden="true">🧾</span>
        <span class="only-text">注文履歴</span>
      </router-link>

      <!-- カート -->
      <div v-if="showCart || actions.includes('cart')" class="cart-wrap">
        <button
          class="cart-chip"
          @click="toggleCartDropdown"
          aria-haspopup="dialog"
          :aria-expanded="String(showCartDropdown)"
        >
          <span class="icon" aria-hidden="true">🛒</span>
          <span class="count">{{ cartCount }}</span>
          <span class="total">¥{{ cartTotal.toLocaleString() }}</span>
        </button>
        <div v-if="showCartDropdown" class="cart-dd" role="dialog" aria-label="カート概要">
          <div class="row"><div>商品数</div><div class="val">{{ cartCount }}点</div></div>
          <div class="row"><div>合計金額</div><div class="val">¥{{ cartTotal.toLocaleString() }}</div></div>
          <div class="actions">
            <router-link to="/cart" class="ghost" @click="closeCart()">カートを見る</router-link>
            <router-link to="/checkout" class="primary" @click="closeCart()">購入に進む</router-link>
          </div>
        </div>
      </div>

      <!-- 店舗ログイン導線（PCで表示。CSSでPAD/スマホ時は非表示にする） -->
      <router-link to="/store-auth/login" class="hd-link" @click="closeCart()">
        店舗様はこちら
      </router-link>

      <!-- 未ログイン -->
      <template v-if="!isLoggedIn">
        <router-link to="/login" class="hd-link">サインイン</router-link>
        <router-link to="/register" class="hd-link">新規登録</router-link>
      </template>

      <div class="user-wrap">
        <button
          class="user-chip icon-only"
          @click="(open = !open, showCartDropdown.value = false)"
          aria-haspopup="menu"
          :aria-expanded="String(open)"
          aria-label="ユーザーメニュー"
        >
          <!-- アバター画像があれば表示。なければ👤 -->
          <template v-if="user?.avatarUrl">
            <img :src="user.avatarUrl" alt="avatar" class="avatar-img" />
          </template>
          <template v-else>👤</template>
        </button>

        <div v-if="open" class="user-dd" role="menu" @click.stop>
          <template v-if="isLoggedIn">
            <div class="user-dd__head">
              <span class="nm">{{ user?.name || 'ユーザー' }}</span>
              <span class="mail" v-if="user?.email">{{ user.email }}</span>
            </div>
            <router-link to="/account/profile" class="item" role="menuitem">プロフィール</router-link>
            <button class="item danger" role="menuitem" @click="doLogout">ログアウト</button>
          </template>
          <template v-else>
            <router-link to="/login" class="item" role="menuitem">サインイン</router-link>
            <router-link to="/register" class="item" role="menuitem">新規登録</router-link>
          </template>
        </div>
      </div>

      <button
        v-if="actions.includes('checkout')"
        class="btn primary"
        @click="$router.push('/checkout')"
      >
        購入に進む
      </button>
      <button
        v-if="actions.includes('support')"
        class="btn"
        @click="$router.push('/support')"
      >
        サポート
      </button>
    </nav>
  </header>

  <!-- 注文履歴タブ：orders系ルートでのみ表示 -->
  <nav v-if="ordersTabs" class="orders-tabs" aria-label="注文履歴タブ">
    <RouterLink to="/orders" class="tab" active-class="is-active" exact-active-class="is-active">注文</RouterLink>
    <RouterLink to="/orders/buy-again" class="tab" active-class="is-active" exact-active-class="is-active">再び購入</RouterLink>
    <RouterLink to="/orders/not-shipped" class="tab" active-class="is-active" exact-active-class="is-active">未発送</RouterLink>
  </nav>
</template>

<style src="@/styles/components/header.css"></style>
