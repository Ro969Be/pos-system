// frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { isLoggedIn, fetchMe } from "@/lib/auth";

const routes = [
  { path: "/", redirect: "/public/shops" },

  // --- 一般
  {
    path: "/public/shops",
    name: "shops-food",
    component: () => import("@/views/public/Shops.vue"),
  },
  {
    path: "/public/webshops",
    name: "webshops",
    component: () => import("@/views/public/WebShops.vue"),
    meta: {
      header: {
        showSearch: false,
        showCart: true,
        showOrdersLink: true,
        variant: "default",
        actions: ["orders", "cart"],
      },
    },
  },
  {
    path: "/public/salons",
    name: "salons",
    component: () => import("@/views/public/Salons.vue"),
  },
  {
    path: "/public/shops/:id",
    name: "shop-detail",
    component: () => import("@/views/public/ShopDetail.vue"),
    props: true,
  },
  {
    path: "/orders",
    name: "Orders",
    component: () => import("@/views/orders/Orders.vue"),
  },
  {
    path: "/orders/buy-again",
    name: "orders-buy-again",
    component: () => import("@/views/orders/BuyAgain.vue"),
    meta: {
      header: {
        ordersTabs: true,
        showCart: true,
        showOrdersLink: true,
        variant: "default",
        actions: ["cart"],
      },
    },
  },
  {
    path: "/orders/not-shipped",
    name: "orders-not-shipped",
    component: () => import("@/views/orders/NotShipped.vue"),
    meta: {
      header: {
        ordersTabs: true,
        showCart: true,
        showOrdersLink: true,
        variant: "default",
        actions: ["cart"],
      },
    },
  },
  {
    path: "/cart",
    name: "cart",
    component: () => import("@/views/Cart.vue"),
    meta: {
      header: {
        showSearch: false,
        showCart: true,
        showOrdersLink: true,
        variant: "compact",
        actions: ["orders", "checkout"],
      },
    },
  },
  {
    path: "/public/reservations",
    name: "reserve",
    component: () => import("@/views/public/Reservations.vue"),
  },
  {
    path: "/public/reservations/complete",
    name: "reserve-complete",
    component: () => import("@/views/public/ReservationComplete.vue"),
  },
  {
    path: "/public/coupons",
    component: () => import("@/views/public/Coupons.vue"),
  },
  {
    path: "/public/reviews",
    name: "Reviews",
    component: () => import("@/views/public/Reviews.vue"),
  },

  {
    path: "/login",
    name: "user-login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/register",
    name: "user-register",
    component: () => import("@/views/auth/RegisterBasic.vue"),
  },
  {
    path: "/register/done",
    name: "user-register-done",
    component: () => import("@/views/auth/RegisterDone.vue"),
  },

  // --- 店舗認証
  {
    path: "/store-auth/login",
    name: "store-login",
    component: () => import("@/views/auth/StoreLogin.vue"),
  },
  {
    path: "/store-auth/register-owner",
    name: "register-owner",
    component: () => import("@/views/auth/RegisterOwner.vue"),
  },
  {
    path: "/store-auth/set-password",
    name: "store-set-password",
    component: () => import("@/views/auth/SetBusinessPassword.vue"),
  },
  // {
  //   path: "/store-auth/register",
  //   name: "store-register",
  //   component: () => import("@/views/auth/StoreRegister.vue"),
  // },
  // {
  //   path: "/store-auth/register/done",
  //   name: "store-register-done",
  //   component: () => import("@/views/auth/RegisterDone.vue"),
  // },

  // ★ 店舗一覧→選択
  {
    path: "/store-auth/select",
    name: "store-select",
    component: () => import("@/views/auth/StoreSelect.vue"),
  },

  // --- アカウント
  {
    path: "/account/profile",
    component: () => import("@/views/account/Profile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/account/profile/edit",
    component: () => import("@/views/account/ProfileEdit.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/account/resume",
    component: () => import("@/views/account/Resume.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/account/preferences",
    component: () => import("@/views/account/Preferences.vue"),
    meta: { requiresAuth: true },
  },

  // --- 店舗認証
  {
    path: "/store-auth/login",
    name: "store-login",
    component: () => import("@/views/auth/StoreLogin.vue"),
  },
  {
    path: "/store-auth/register",
    name: "store-register",
    component: () => import("@/views/auth/StoreRegister.vue"),
  },
  {
    path: "/store-auth/register/done",
    name: "store-register-done",
    component: () => import("@/views/auth/RegisterDone.vue"),
  },

  {
    path: "/store-auth/select",
    name: "store-select",
    component: () => import("@/views/auth/StoreSelect.vue"),
  },

  // --- 店舗向け（要ログイン）
  {
    path: "/store/dashboard",
    component: () => import("@/views/store/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/store/reservations",
    component: () => import("@/views/store/ReservationBoard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/store/kitchen",
    name: "kitchen-monitor",
    component: () => import("@/views/store/KitchenMonitor.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/store/hall",
    name: "hall-monitor",
    component: () => import("@/views/store/HallMonitor.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/store/inventory",
    component: () => import("@/views/store/Inventory.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/store/sales",
    name: "sales",
    component: () => import("@/views/store/Sales.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/store/analysis",
    component: () => import("@/views/store/Analysis.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/store/pos",
    name: "pos",
    component: () => import("@/views/store/POS.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/store/settings",
    name: "store-settings",
    component: () => import("@/views/store/Settings.vue"),
    meta: { requiresAuth: true },
  },

  { path: "/:pathMatch(.*)*", redirect: "/public/shops" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// --- ルートガード
let meFetched = false;
router.beforeEach(async (to) => {
  if (!meFetched && localStorage.getItem("token")) {
    meFetched = true;
    await fetchMe();
  }
  if (to.meta?.requiresAuth && !isLoggedIn.value) {
    return { path: "/store-auth/login", query: { next: to.fullPath } };
  }
  return true;
});

export default router;
