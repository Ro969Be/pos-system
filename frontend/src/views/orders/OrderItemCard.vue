<template>
  <article class="order-card">
    <header class="order-head">
      <div class="meta">
        <div><strong>注文日:</strong> {{ order.orderedAt }}</div>
        <div><strong>合計:</strong> ¥{{ order.total.toLocaleString() }}</div>
        <div class="shipto">
          <strong>お届け先:</strong>
          <span class="name" :title="`${order.shipTo.name}\n${order.shipTo.zip}\n${order.shipTo.address}`">
            {{ order.shipTo.name }}
          </span>
        </div>
        <div><strong>注文番号:</strong> <code>{{ order.id }}</code></div>
      </div>
      <div class="head-actions">
        <button class="btn ghost" @click="$emit('toggleDetails', order.id)">注文内容を表示</button>
        <button class="btn ghost" @click="$emit('receipt', order.id)">領収書等</button>
      </div>
    </header>

    <section v-if="expanded" class="order-body">
      <ul class="items">
        <li v-for="it in order.items" :key="it.sku">
          <span class="ttl">{{ it.title }}</span>
          <span>×{{ it.qty }}</span>
          <span>¥{{ it.price.toLocaleString() }}</span>
        </li>
      </ul>

      <div class="actions">
        <button class="btn" @click="$emit('problem', order.id)">注文に関する問題</button>
        <button class="btn" @click="$emit('track', order.id)">配送状況を確認</button>
        <button class="btn" @click="$emit('return', order.id)">商品の返品または交換</button>
        <button class="btn" @click="$emit('rateSeller', order.id)">出品者を評価</button>
        <button class="btn" @click="$emit('review', order.id)">商品レビューを書く</button>
        <button class="btn primary" @click="$emit('buyAgain', order.id)">再度購入</button>
      </div>
    </section>
  </article>
</template>

<script setup>
defineProps({
  order: { type: Object, required: true },
  expanded: { type: Boolean, default: false },
});
</script>

<style scoped>
.order-card{ border:1px solid #e5e5e5; border-radius:10px; background:#fff; margin-bottom:14px; }
.order-head{
  display:flex; justify-content:space-between; gap:12px; padding:12px;
  border-bottom:1px solid #f0f0f0;
}
.meta{ display:grid; grid-template-columns: repeat(2,minmax(120px,1fr)); gap:8px 16px; font-size:14px; }
.shipto .name{ text-decoration: underline dotted; cursor: help; }
.head-actions{ display:flex; gap:8px; align-items:center; }
.order-body{ padding:12px; }
.items{ list-style:none; padding:0; margin:0 0 8px; display:grid; gap:6px; }
.items li{ display:grid; grid-template-columns: 1fr auto auto; gap:8px; }
.ttl{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.actions{ display:flex; flex-wrap:wrap; gap:8px; }
.btn{ padding:8px 10px; border:1px solid #ddd; background:#fff; border-radius:8px; cursor:pointer; }
.btn.primary{ border:none; background:#222; color:#fff; font-weight:700; }
.btn.ghost{ background:#fff; }
@media (max-width: 640px){
  .order-head{ flex-direction:column; }
  .meta{ grid-template-columns: 1fr; }
}
</style>
