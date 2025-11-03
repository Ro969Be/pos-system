<template>
  <aside class="sidebar">
    <nav>
      <div class="nav-group">
        <div class="nav-title">Public</div>
        <router-link to="/public/top" class="nav-link" :class="active('/public/top')">TOP</router-link>
        <router-link to="/public/shops" class="nav-link" :class="active('/public/shops')">店舗一覧</router-link>
        <router-link to="/public/reservations" class="nav-link" :class="active('/public/reservations')">予約</router-link>
        <router-link to="/public/coupons" class="nav-link" :class="active('/public/coupons')">クーポン</router-link>
        <router-link to="/public/reviews" class="nav-link" :class="active('/public/reviews')">口コミ</router-link>
        <router-link to="/public/profile/register" class="nav-link" :class="active('/public/profile')">個人情報登録</router-link>
      </div>

      <div class="nav-group">
        <div class="nav-title">Jobs</div>
        <router-link to="/jobs" class="nav-link" :class="active('/jobs')">求人一覧</router-link>
        <router-link to="/jobs/saved" class="nav-link" :class="active('/jobs/saved')">保存・応募状況</router-link>
        <router-link to="/jobs/messages" class="nav-link" :class="active('/jobs/messages')">メッセージ</router-link>
      </div>

      <div class="nav-group">
        <div class="nav-title">Account</div>
        <router-link to="/account/profile" class="nav-link" :class="active('/account/profile')">プロフィール</router-link>
        <router-link to="/account/resume" class="nav-link" :class="active('/account/resume')">履歴書</router-link>
      </div>

      <div class="nav-group">
        <div class="nav-title">Store</div>
        <router-link to="/store/dashboard" class="nav-link" :class="active('/store/dashboard')">ダッシュボード</router-link>
        <router-link to="/store/reservations" class="nav-link" :class="active('/store/reservations')">予約管理</router-link>
        <router-link to="/store/kitchen" class="nav-link" :class="active('/store/kitchen')">キッチン</router-link>
        <router-link to="/store/hall" class="nav-link" :class="active('/store/hall')">ホール</router-link>
        <router-link to="/store/inventory" class="nav-link" :class="active('/store/inventory')">在庫</router-link>
        <router-link to="/store/sales" class="nav-link" :class="active('/store/sales')">売上</router-link>
        <router-link to="/store/analysis" class="nav-link" :class="active('/store/analysis')">分析</router-link>
        <router-link to="/store/pos" class="nav-link" :class="active('/store/pos')">レジ</router-link>
        <router-link to="/store/settings" class="nav-link" :class="active('/store/settings')">設定</router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();

const active = (prefix) => ({
  active: route.path.startsWith(prefix),
});
</script>
