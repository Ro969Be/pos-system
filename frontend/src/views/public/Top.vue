<template>
  <section class="page">
    <h2>トップ</h2>
    <p class="sub">来店者向けの入口ページ（店舗検索や予約への導線）。</p>

    <div class="cards">
      <div class="card">
        <h3>店舗を探す</h3>
        <router-link class="btn" to="/public/shops">店舗一覧へ</router-link>
      </div>
      <div class="card">
        <h3>予約する</h3>
        <router-link class="btn" to="/public/reservations">予約ページへ</router-link>
      </div>
      <div class="card">
        <h3>クーポンを見る</h3>
        <router-link class="btn" to="/public/coupons">クーポンへ</router-link>
      </div>
    </div>
  </section>
</template>
<script setup></script>
<style src="../../styles/pages/Top.css"></style>
