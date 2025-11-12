<template>
  <main class="cart-page">
    <h1>ショッピングカート</h1>

    <div v-if="cart.items.length === 0" class="empty">
      <p>カートは空です。</p>
      <RouterLink to="/public/webshops" class="btn link">お買い物を続ける</RouterLink>
    </div>

    <div v-else class="layout">
      <section class="basket">
        <div class="line" v-for="it in cart.items" :key="it.id">
          <img class="thumb" :src="it.image || '/img/no-image.png'" alt="" />
          <div class="info">
            <div class="ttl">{{ it.title }}</div>
            <div class="meta" v-if="it.shopName">出品者: {{ it.shopName }}</div>
            <div class="price">¥{{ (it.price * it.qty).toLocaleString() }}</div>
            <div class="qty">
              <label>数量</label>
              <input type="number" min="1" max="99" :value="it.qty" @input="onQty(it.id, $event.target.value)" />
              <button class="link danger" @click="onRemove(it.id)">削除</button>
            </div>
          </div>
        </div>
        <button class="btn ghost" @click="onClear">カートを空にする</button>
      </section>

      <aside class="summary">
        <div class="row">
          <span>小計</span>
          <b>¥{{ subtotal.toLocaleString() }}</b>
        </div>
        <div class="row">
          <span>消費税 ({{ Math.round(taxRate*100) }}%)</span>
          <b>¥{{ tax.toLocaleString() }}</b>
        </div>
        <div class="row total">
          <span>合計</span>
          <b>¥{{ total.toLocaleString() }}</b>
        </div>

        <RouterLink to="/checkout" class="btn primary block">購入に進む</RouterLink>
        <RouterLink to="/public/webshops" class="btn ghost block">買い物を続ける</RouterLink>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { cart, subtotal, total, tax, taxRate, setQty, remove, clear } from "@/lib/cart";
function onQty(id, v){ setQty(id, v); }
function onRemove(id){ remove(id); }
function onClear(){ clear(); }
</script>

<style src="@/styles/pages/cart.css"></style>
