<template>
  <section class="page pos">
    <div class="pos-header">
      <h2>POSレジ</h2>
      <div class="pos-actions">
        <select v-model="table" class="sel">
          <option value="">テーブル未選択</option>
          <option v-for="t in tables" :key="t" :value="t">Table {{ t }}</option>
        </select>
        <button class="btn ghost" @click="clearCart">クリア</button>
      </div>
    </div>

    <div class="pos-body">
      <!-- メニュー -->
      <div class="panel menu">
        <div class="menu-head">
          <input v-model="keyword" class="inp" placeholder="メニュー検索" />
          <div class="chips">
            <button
              v-for="c in categories"
              :key="c"
              class="chip"
              :class="{ active: cat===c }"
              @click="cat = (cat===c ? '' : c)"
            >{{ c }}</button>
          </div>
        </div>
        <div class="menu-grid">
          <button
            v-for="m in filteredMenu"
            :key="m.id"
            class="menu-item"
            @click="add(m)"
          >
            <div class="mi-name">{{ m.name }}</div>
            <div class="mi-price">¥{{ m.price.toLocaleString() }}</div>
            <div class="mi-cat">{{ m.category }}</div>
          </button>
        </div>
      </div>

      <!-- カート -->
      <div class="panel cart">
        <h3>会計</h3>
        <div class="lines" v-if="lines.length">
          <div class="line" v-for="(l,i) in lines" :key="l.id">
            <div class="ln-name">{{ l.name }}</div>
            <div class="ln-qty">
              <button class="btn xs" @click="dec(i)">-</button>
              <input class="qty" type="number" min="1" v-model.number="lines[i].qty"/>
              <button class="btn xs" @click="inc(i)">+</button>
            </div>
            <div class="ln-price">¥{{ (l.price*l.qty).toLocaleString() }}</div>
            <button class="btn ghost xs" @click="remove(i)">削除</button>
          </div>
        </div>
        <div v-else class="empty">商品を追加してください</div>

        <div class="sum">
          <div><span>小計</span><b>¥{{ sub.toLocaleString() }}</b></div>
          <div><span>消費税(10%)</span><b>¥{{ tx.toLocaleString() }}</b></div>
          <div class="ttl"><span>合計</span><b>¥{{ ttl.toLocaleString() }}</b></div>
        </div>

        <div class="pay">
          <label>お預かり</label>
          <input class="inp" type="number" min="0" v-model.number="payAmount" />
          <div class="change">お釣り：<b>¥{{ change.toLocaleString() }}</b></div>
        </div>

        <div class="ops">
          <button class="btn" :disabled="!canCheckout" @click="checkout('cash')">現金会計</button>
          <button class="btn" :disabled="!canCheckout" @click="checkout('card')">カード会計</button>
        </div>
      </div>
    </div>

    <!-- レシート -->
    <div v-if="receipt" class="receipt">
      <h3>レシート</h3>
      <div class="rc-head">
        <div>伝票番号：{{ receipt.id }}</div>
        <div>Table {{ receipt.table || '-' }}</div>
        <div>{{ receipt.ts }}</div>
        <div>決済：{{ receipt.method === 'cash' ? '現金' : 'カード' }}</div>
      </div>
      <div class="rc-lines">
        <div class="rc-line" v-for="r in receipt.lines" :key="r.id">
          <span>{{ r.name }} × {{ r.qty }}</span>
          <b>¥{{ (r.price*r.qty).toLocaleString() }}</b>
        </div>
      </div>
      <div class="rc-sum">
        <div><span>小計</span><b>¥{{ receipt.sub.toLocaleString() }}</b></div>
        <div><span>税</span><b>¥{{ receipt.tax.toLocaleString() }}</b></div>
        <div class="ttl"><span>合計</span><b>¥{{ receipt.total.toLocaleString() }}</b></div>
      </div>

      <div class="rc-ops">
        <button class="btn ghost" @click="printReceipt">印刷</button>
        <button class="btn" @click="closeReceipt">閉じる</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { catalog, subtotal, tax, total } from "@/lib/dummy/catalog";
import { can } from "@/lib/auth";

const tables = ["A1","A2","B1","B2","C1","C2"];
const table = ref("");

const keyword = ref("");
const cat = ref("");
const categories = Array.from(new Set(catalog.map(m=>m.category)));

const filteredMenu = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  return catalog.filter(m => {
    const passCat = !cat.value || m.category === cat.value;
    const passKw = !k || m.name.toLowerCase().includes(k);
    return passCat && passKw;
  });
});

const lines = reactive([]);
function add(m){
  const i = lines.findIndex(x=>x.id===m.id);
  if(i>=0) lines[i].qty++;
  else lines.push({ id:m.id, name:m.name, price:m.price, qty:1 });
}
function inc(i){ lines[i].qty++; }
function dec(i){ lines[i].qty = Math.max(1, lines[i].qty-1); }
function remove(i){ lines.splice(i,1); }
function clearCart(){ lines.splice(0, lines.length); table.value=""; payAmount.value=0; }

const sub = computed(() => subtotal(lines));
const tx  = computed(() => tax(sub.value));
const ttl = computed(() => total(sub.value, tx.value));

const payAmount = ref(0);
const change = computed(() => Math.max(0, payAmount.value - ttl.value));
const canCheckout = computed(() => can("pos.checkout") && lines.length>0);

const receipt = ref(null);

function checkout(method){
  if(!canCheckout.value) return;
  const id = "R-" + Math.random().toString(36).slice(2,8).toUpperCase();
  receipt.value = {
    id,
    method, table: table.value || "",
    ts: new Date().toLocaleString("ja-JP"),
    lines: JSON.parse(JSON.stringify(lines)),
    sub: sub.value, tax: tx.value, total: ttl.value,
  };
  // 会計後クリア（領収書は残す）
  clearCart();
}
function closeReceipt(){ receipt.value = null; }
function printReceipt(){ window.print(); }
</script>

<style src="../../styles/pages/POS.css"></style>
