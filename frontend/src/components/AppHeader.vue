<template>
  <header class="header">
    <div class="brand">
      <div class="brand-badge"></div>
      <h1>POS Dashboard</h1>
    </div>

    <div class="actions">
      <router-link class="btn" to="/settings">設定</router-link>
      <router-link class="btn" to="/login">ログイン</router-link>
    </div>
  </header>
</template>

<script setup>
// 今は特にロジックなし（必要になれば追加OK）
</script>

<style scoped>
/* もしここで個別スタイルを書きたい場合のみ使用 */
/* styles.css を全体スタイルにしているなら空のままでもOK */
</style>
