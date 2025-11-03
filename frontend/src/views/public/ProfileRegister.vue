<template>
  <section class="page profile-page">
    <h2>個人情報登録</h2>
    <p class="sub">事前登録でご案内をスムーズに。</p>
    <form @submit.prevent="$router.push('/public/profile/done')" class="profile-form">
      <input class="field" placeholder="氏名" />
      <input class="field" placeholder="メールアドレス" />
      <button class="btn">登録する</button>
    </form>
  </section>
</template>
<script setup></script>
<style src="../../styles/pages/PublicProfile.css"></style>
