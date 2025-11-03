import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // 共通
  { path: "/", redirect: "/public/top" },
  { path: "/login", component: () => import("../views/Login.vue") },

  // Public（来店者向け）
  { path: "/public/top", component: () => import("../views/public/Top.vue") },
  { path: "/public/shops", component: () => import("../views/public/ShopList.vue") },         // 食べログ相当の一覧
  { path: "/public/shops/:id", component: () => import("../views/public/ShopDetail.vue") },   // 店舗詳細
  { path: "/public/reservations", component: () => import("../views/public/Reservations.vue") },
  { path: "/public/reservations/done", component: () => import("../views/public/ReservationDone.vue") }, // 予約完了（→GCal） :contentReference[oaicite:11]{index=11}
  { path: "/public/coupons", component: () => import("../views/public/Coupons.vue") },
  { path: "/public/reviews", component: () => import("../views/public/Reviews.vue") },
{ path: "/public/profile/register", component: () => import("../views/public/ProfileRegister.vue") }, // 来店者向け 個人情報登録
  { path: "/public/profile/done", component: () => import("../views/public/ProfileDone.vue") },
  // Jobs
  { path: "/jobs", component: () => import("../views/jobs/JobsList.vue") },                    // 検索/ソート/保存 :contentReference[oaicite:12]{index=12}
  { path: "/jobs/saved", component: () => import("../views/jobs/JobsSaved.vue") },             // 保存・応募管理
  { path: "/jobs/applied", component: () => import("../views/jobs/JobsApplied.vue") },
  { path: "/jobs/messages", component: () => import("../views/jobs/JobsMessageList.vue") },
  { path: "/jobs/:id", component: () => import("../views/jobs/JobDetail.vue") },

  // Account
  { path: "/account/profile", component: () => import("../views/account/Profile.vue") },       // 基本情報/住所/公開トグル等 :contentReference[oaicite:13]{index=13}
  { path: "/account/resume", component: () => import("../views/account/Resume.vue") },         // 履歴書/スカウト/編集 :contentReference[oaicite:14]{index=14}
  { path: "/account/preferences", component: () => import("../views/account/Preferences.vue") },

  // Store（店舗側）
  { path: "/store/dashboard", component: () => import("../views/store/Dashboard.vue") },
  { path: "/store/reservations", component: () => import("../views/store/ReservationBoard.vue") }, // カレンダー/テーブル/詳細 :contentReference[oaicite:15]{index=15}
  { path: "/store/kitchen", component: () => import("../views/store/KitchenMonitor.vue") },
  { path: "/store/hall", component: () => import("../views/store/HallMonitor.vue") },
  { path: "/store/inventory", component: () => import("../views/store/Inventory.vue") },       // 在庫数ルールを後で反映 :contentReference[oaicite:16]{index=16}
  { path: "/store/sales", component: () => import("../views/store/Sales.vue") },               // 日/曜/商品別 + PDF/CSV :contentReference[oaicite:17]{index=17}
  { path: "/store/analysis", component: () => import("../views/store/Analysis.vue") },         // 全店舗一覧・FLR比率のハブ
  { path: "/store/pos", component: () => import("../views/store/POS.vue") },                   // レジ/取引/印刷 等の入口 :contentReference[oaicite:18]{index=18}
  { path: "/store/settings", component: () => import("../views/store/Settings.vue") },

  { path: "/:pathMatch(.*)*", redirect: "/public/top" },
];

export default createRouter({ history: createWebHistory(), routes });
