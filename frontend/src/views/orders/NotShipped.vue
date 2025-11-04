<template>
  <main class="orders-page">
    <h1>未発送</h1>
    <p>発送前の注文をまとめて表示します（ダミー）。</p>
    <table class="tbl">
      <thead><tr><th>注文番号</th><th>注文日</th><th>合計</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="i in 3" :key="i">
          <td>2025-NS-00{{ i }}</td>
          <td>2025/11/0{{ i }}</td>
          <td>¥{{ (3000*i).toLocaleString() }}</td>
          <td>
            <button class="btn">住所変更</button>
            <button class="btn">支払い方法の変更</button>
            <button class="btn danger">注文をキャンセル</button>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup>
</script>

<style scoped>
.orders-page{ padding:16px; }
.tbl{ width:100%; border-collapse: collapse; background:#fff; }
th, td{ border:1px solid #eee; padding:8px; text-align:left; }
.btn{ padding:6px 10px; border:1px solid #ddd; background:#fff; border-radius:8px; cursor:pointer; margin-right:6px; }
.btn.danger{ border-color:#f3c2c2; background:#ffecec; }
</style>
