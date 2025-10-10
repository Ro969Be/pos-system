// index.ts

import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import AdminPanel from "../views/AdminPanel.vue";
import Products from "../views/Products.vue";
import Orders from "../views/Orders.vue";
import Reports from "../views/Reports.vue";
import { useAuthStore } from "../stores/auth";

const routes: RouteRecordRaw[] = [
  // デフォルトはダッシュボードへリダイレクト
  { path: "/", redirect: "/dashboard" },

  // ログイン画面
  { path: "/login", name: "Login", component: Login },

  // ダッシュボード（ログイン必須）
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },

  // 商品管理（管理者のみ）
  {
    path: "/products",
    name: "Products",
    component: Products,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // 注文管理（ログイン必須）
  {
    path: "/orders",
    name: "Orders",
    component: Orders,
    meta: { requiresAuth: true },
  },

  // レポート（管理者のみ）
  {
    path: "/reports",
    name: "Reports",
    component: Reports,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // 管理者パネル（管理者専用）
  {
    path: "/admin",
    name: "AdminPanel",
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔒 グローバルガード
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.token) {
    return next("/login");
  }

  if (to.meta.requiresAdmin && !auth.isAdmin()) {
    alert("管理者権限が必要です");
    return next("/dashboard");
  }

  next();
});

export default router;
