<template>
  <section class="page prof">
    <h2>プロフィール</h2>
    <div class="cards">
      <router-link class="card link" to="/account/profile/edit">
        <h3>変更</h3>
        <p>名前（表示）・連絡先一覧（メール / TEL / 住所）</p>
      </router-link>
      <router-link class="card link" to="/account/profile/personal">
        <h3>個人情報</h3>
        <p>姓・セイ・名・メイ・性別・生年月日・Phone・番号公開</p>
      </router-link>
      <router-link class="card link" to="/account/profile/address">
        <h3>住所</h3>
        <p>国・郵便番号・都道府県・市区町村・地名・番地・建物名</p>
      </router-link>
    </div>
  </section>
</template>
<script setup></script>
<style src="@/styles/pages/Profile.css"></style>
