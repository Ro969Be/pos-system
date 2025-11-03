<template>
  <section class="page" style="max-width:480px;margin:0 auto;">
    <h2>ログイン</h2>
    <p class="sub">共通ログインフォーム（デザインのみ）。</p>
    <form @submit.prevent>
      <div style="display:grid;gap:10px;margin-top:12px;">
        <input class="field" type="text" placeholder="メールアドレス" />
        <input class="field" type="password" placeholder="パスワード" />
        <button class="btn">ログイン</button>
      </div>
    </form>
  </section>
</template>
<script setup></script>
