import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // 共通
  { path: "/", redirect: "/public/shops" },

  // 一般（ログイン / 新規登録）
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/RegisterBasic.vue"),
  },
  {
    path: "/register/done",
    name: "register-done",
    component: () => import("@/views/auth/RegisterDone.vue"),
  },

  // ★ 店舗様向け（一般と別導線）
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

  // Public（来店者向け）
  {
    path: "/public/shops",
    name: "shops-hub",
    component: () => import("@/views/public/Shops.vue"),
  },
  {
    path: "/public/shops/:id",
    name: "shop-detail",
    component: () => import("@/views/public/ShopDetail.vue"),
    props: true,
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
    component: () => import("@/views/public/Reviews.vue"),
  },
  {
    path: "/public/profile/register",
    component: () => import("@/views/public/ProfileRegister.vue"),
  },
  {
    path: "/public/profile/done",
    component: () => import("@/views/public/ProfileDone.vue"),
  },

  // Account（プロフィール）
  {
    path: "/account/profile",
    component: () => import("@/views/account/Profile.vue"),
  },
  {
    path: "/account/profile/edit",
    component: () => import("@/views/account/ProfileEdit.vue"),
  },
  {
    path: "/account/profile/personal",
    component: () => import("@/views/account/ProfilePersonal.vue"),
  },
  {
    path: "/account/profile/address",
    component: () => import("@/views/account/ProfileAddress.vue"),
  },

  // Store（店舗側）
  {
    path: "/store/dashboard",
    component: () => import("@/views/store/Dashboard.vue"),
  },
  {
    path: "/store/reservations",
    component: () => import("@/views/store/ReservationBoard.vue"),
  },
  {
    path: "/store/kitchen",
    name: "kitchen-monitor",
    component: () => import("@/views/store/KitchenMonitor.vue"),
  },
  {
    path: "/store/hall",
    name: "hall-monitor",
    component: () => import("@/views/store/HallMonitor.vue"),
  },
  {
    path: "/store/inventory",
    component: () => import("@/views/store/Inventory.vue"),
  },
  {
    path: "/store/sales",
    name: "sales",
    component: () => import("@/views/store/Sales.vue"),
  },
  {
    path: "/store/analysis",
    component: () => import("@/views/store/Analysis.vue"),
  },
  {
    path: "/store/pos",
    name: "pos",
    component: () => import("@/views/store/POS.vue"),
  },
  {
    path: "/store/settings",
    component: () => import("@/views/store/Settings.vue"),
  },

  // 404
  { path: "/:pathMatch(.*)*", redirect: "/public/shops" },

  // Amazon風 注文履歴
  {
    path: "/orders",
    name: "orders",
    component: () => import("@/views/orders/Orders.vue"),
    meta: { header: { ordersTabs: true, showCart: true, showOrdersLink: true, variant: "default", actions: ["cart"] } },
  },
  {
    path: "/orders/buy-again",
    name: "orders-buy-again",
    component: () => import("@/views/orders/BuyAgain.vue"),
    meta: { header: { ordersTabs: true, showCart: true, showOrdersLink: true, variant: "default", actions: ["cart"] } },
  },
  {
    path: "/orders/not-shipped",
    name: "orders-not-shipped",
    component: () => import("@/views/orders/NotShipped.vue"),
    meta: { header: { ordersTabs: true, showCart: true, showOrdersLink: true, variant: "default", actions: ["cart"] } },
  },
];

export default createRouter({ history: createWebHistory(), routes, scrollBehavior(){ return { top: 0 }; } });
