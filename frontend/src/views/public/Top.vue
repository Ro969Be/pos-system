<template>
  <section class="page auth-top">
    <h2>トップページ</h2>
    <p class="sub">一般向けメニュー</p>

    <div class="cards">
      <div class="card">
        <h3>ログイン</h3>
        <p>メール＋パスワード または LINEでログイン</p>
        <router-link class="btn" to="/login">ログインへ</router-link>
      </div>

      <div class="card">
        <h3>新規登録</h3>
        <p>まずは基本情報を入力してください</p>
        <router-link class="btn ghost" to="/register">新規登録へ</router-link>
      </div>
    </div>
  </section>
</template>

<script setup></script>
<style src="../../styles/pages/Auth.css"></style>
