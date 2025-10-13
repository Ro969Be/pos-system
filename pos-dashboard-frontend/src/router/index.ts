// pos-dashboard-frontend/src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import LandingPage from "../views/LandingPage.vue";
import StoreLogin from "../views/StoreLogin.vue";
import UserLogin from "../views/UserLogin.vue";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import AdminPanel from "../views/AdminPanel.vue";
import Products from "../views/Products.vue";
import Orders from "../views/Orders.vue";
import Reports from "../views/Reports.vue";
import CategoryPresetManagement from "../views/CategoryPresetManagement.vue";
import { useAuthStore } from "../stores/auth";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "Landing", component: LandingPage },

  { path: "/store-login", name: "StoreLogin", component: StoreLogin },
  { path: "/user-login", name: "UserLogin", component: UserLogin },

  { path: "/login", name: "Login", component: Login },

  { path: "/dashboard", name: "Dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/products", name: "Products", component: Products, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/orders", name: "Orders", component: Orders, meta: { requiresAuth: true } },
  { path: "/reports", name: "Reports", component: Reports, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/customers", name: "CustomersList", component: () => import("@/views/CustomersList.vue"),},
  { path: "/customers/:id", name: "CustomerDetail", component: () => import("@/views/CustomerDetail.vue"),},
  { path: "/tables", name: "TableLayout", component: () => import("@/views/TableLayout.vue"),},
  { path: "/reservations/new", name: "ReservationForm", component: () => import("@/views/ReservationForm.vue"),},

  // 管理画面: カテゴリプリセット管理（管理者のみ）
  { path: "/admin/category-presets", name: "CategoryPresetManagement", component: CategoryPresetManagement, meta: { requiresAuth: true, requiresAdmin: true } },

  // 管理パネル
  { path: "/admin", name: "AdminPanel", component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// グローバルガード（簡易）
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
