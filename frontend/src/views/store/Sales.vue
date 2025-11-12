<template>
  <section class="page sales">
    <h2>売上ダッシュボード</h2>
    <p class="sub">※データはダミーです。バックエンド接続は後で行います。</p>

    <!-- ダッシュボード本体を読み込み -->
    <SalesDashboard />
  </section>
</template>

<script setup>
import SalesDashboard from "@/views/store/SalesDashboard.vue";
</script>

<style src="../../styles/pages/Sales.css"></style>
