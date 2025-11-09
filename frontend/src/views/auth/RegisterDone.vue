<template>
  <section class="page auth">
    <h2>登録完了</h2>
    <div class="panel">
      <p>ご登録ありがとうございました。</p>
      <ul class="kv">
        <li><b>UserId</b><span>{{ q.userId || "-" }}</span></li>
        <li><b>名前</b><span>{{ q.name || "-" }}</span></li>
        <li><b>名前(カナ)</b><span>{{ q.nameKana || "-" }}</span></li>
        <li><b>電話番号</b><span>{{ q.tel || "-" }}</span></li>
        <li><b>メール</b><span>{{ q.email || "-" }}</span></li>
      </ul>
      <div class="ops">
        <router-link class="btn" to="/login">ログインへ進む</router-link>
        <router-link class="btn ghost" to="/public/shops">トップへ戻る</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRoute } from "vue-router";

// ルーターのクエリをそのまま利用（/register/done?userId=... など）
const route = useRoute();
const q = route.query;
</script>

<style src="../../styles/pages/Auth.css"></style>
