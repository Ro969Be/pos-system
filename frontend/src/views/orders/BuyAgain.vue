<template>
  <main class="orders-page">
    <h1>再び購入</h1>
    <p>過去購入した商品のおすすめを表示します（ダミー）。</p>
    <ul class="grid">
      <li v-for="i in 8" :key="i" class="card">
        <div class="img">📦</div>
        <div class="ttl">リピート商品 #{{ i }}</div>
        <button class="btn primary">カートに入れる</button>
      </li>
    </ul>
  </main>
</template>

<script setup>
</script>

<style scoped>
.orders-page{ padding:16px; }
.grid{ display:grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap:12px; margin:12px 0; list-style:none; padding:0; }
.card{ border:1px solid #e5e5e5; border-radius:10px; padding:12px; background:#fff; display:flex; flex-direction:column; gap:8px; align-items:flex-start; }
.img{ font-size:32px; }
.btn.primary{ padding:8px 10px; border:none; background:#222; color:#fff; border-radius:8px; cursor:pointer; font-weight:700; }
</style>
