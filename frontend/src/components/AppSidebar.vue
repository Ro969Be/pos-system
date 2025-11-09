<!-- frontend/src/components/AppSidebar.vue -->
<template>
  <!-- ★★ オーバーレイは App.vue でのみ描画する。ここでは出さない ★★ -->
  <aside class="sidebar" :class="[{ 'is-open': open }]">
    <nav class="menu">
      <button
        v-for="m in menus"
        :key="m.path"
        class="nav-link"
        :class="{ active: m.active }"
        @click="go(m.path)"
      >
        <span class="icon">{{ m.icon }}</span>
        <span class="label">{{ m.label }}</span>
      </button>
    </nav>

    <div class="bottom-auth">
      <button v-if="!isLoggedIn" class="nav-link outline" @click="go('/store-auth/login')">🏬 店舗様はこちら</button>

      <div class="userbox" v-if="isLoggedIn">
        <button class="nav-link user" @click.stop="openUser = !openUser">
          👤 {{ user?.name || 'ユーザー' }}（{{ user?.store?.name || '店舗未設定' }}） <span class="caret">▾</span>
        </button>
        <div v-if="openUser" class="user-menu" @click.stop>
          <button class="item" @click="go('/account/profile')">プロフィール</button>
          <button class="item danger" @click="doLogout">ログアウト</button>
        </div>
      </div>

      <template v-else>
        <button class="nav-link ghost" @click="go('/login')">🔐 ログイン</button>
        <button class="nav-link ghost" @click="go('/register')">📝 新規登録</button>
      </template>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
// ✅ 新APIに合わせて import を修正（旧: auth, logoutMock）
import { currentUser, can, isLoggedIn, logout } from "@/lib/auth";
import { ui, closeSidebar } from "@/lib/ui";

defineProps({ open: { type: Boolean, default: false } });

const route = useRoute();
const router = useRouter();

// 旧: const user = computed(() => auth.user);
// 新: currentUser は ComputedRef なのでそのまま参照
const user = currentUser;

const menus = computed(() => {
  // 全員に見せるメニュー
  const base = [
    { label: "店舗一覧", path: "/public/shops", icon: "🏬" },
    { label: "予約", path: "/public/reservations", icon: "📅" },
    { label: "クーポン", path: "/public/coupons", icon: "🎫" },
    { label: "口コミ", path: "/public/reviews", icon: "📝" },
  ];

  // ✅ ログイン済みの人にだけ「プロフィール」を追加
  if (isLoggedIn.value) {
    base.splice(1, 0, { label: "プロフィール", path: "/account/profile", icon: "👤" });
  }

  // 権限で出し分ける店舗向けメニュー
  const storeOnly = [
    can("kitchen.view") && { label: "キッチン", path: "/store/kitchen", icon: "🍳" },
    can("hall.view")    && { label: "ホール",   path: "/store/hall",    icon: "🛎️" },
    can("pos.view")     && { label: "レジ (POS)", path: "/store/pos",   icon: "💳" },
    can("sales.view")   && { label: "売上ダッシュボード", path: "/store/sales", icon: "📈" },
  ];

  return [...base, ...storeOnly]
    .filter(Boolean)
    .map(m => ({ ...m, active: route.path.startsWith(m.path) }));
});

const go = (path) => {
  if (path !== route.path) router.push(path);
  closeSidebar(); // モバイル時は閉じる
};

const openUser = ref(false);
async function doLogout(){
  await logout();            // 旧: logoutMock()
  openUser.value = false;
  router.push("/public/shops");
}
function onWinClick(){ if (openUser.value) openUser.value = false; }
onMounted(() => window.addEventListener("click", onWinClick));
onBeforeUnmount(() => window.removeEventListener("click", onWinClick));
</script>

<style src="@/styles/components/sidebar.css"></style>
