<template>
  <section class="page prof">
    <h2>プロフィール</h2>
    <div class="cards">
      <router-link class="card link" to="/account/profile/personal">
        <h3>個人情報</h3>
        <p>住所・名前・性別・生年月日・連絡先</p>
      </router-link>
      <router-link class="card link" to="/account/preferences">
        <h3>履歴書＆職務経歴書</h3>
        <p>資格・証明写真・学歴・職務経歴</p>
      </router-link>
      <router-link class="card link" to="/account/resume">
        <h3>求職希望条件</h3>
        <p>希望年収・希望勤務地・その他条件</p>
      </router-link>
    </div>
  </section>
</template>
<script setup></script>
<style src="@/styles/pages/Profile.css"></style>
