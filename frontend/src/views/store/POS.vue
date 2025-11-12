<!-- frontend/src/views/store/POS.vue -->
<template>
  <section class="page pos">
    <div class="pos-header">
      <h2>POSレジ</h2>
      <div class="pos-actions">
        <select v-model="tableId" class="sel">
          <option value="">テーブル未選択</option>
          <option v-for="t in tables" :key="t._id" :value="t._id">Table {{ t.name }}</option>
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
            <button v-for="c in categories" :key="c" class="chip" :class="{ active: cat===c }" @click="cat = (cat===c ? '' : c)">{{ c }}</button>
          </div>
        </div>
        <div class="menu-grid">
          <button v-for="m in filteredMenu" :key="m._id" class="menu-item" :disabled="m.inventory?.hidden" @click="add(m)">
            <div class="mi-name">{{ m.name }}</div>
            <div class="mi-price">¥{{ (m.price||0).toLocaleString() }}</div>
            <div class="mi-cat">{{ m.category }}</div>
            <div v-if="m.inventory" class="mi-inv" :class="{ low: m.inventory.low, out: m.inventory.hidden }">
              {{ m.inventory.hidden ? '在庫切れ' : (m.inventory.low ? '残りわずか' : '') }}
            </div>
          </button>
        </div>
      </div>

      <!-- カート -->
      <div class="panel cart">
        <h3>会計</h3>
        <div class="lines" v-if="lines.length">
          <div class="line" v-for="(l,i) in lines" :key="l.menuItemId + ':' + i">
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
          <div><span>消費税</span><b>¥{{ tx.toLocaleString() }}</b></div>
          <div class="ttl"><span>合計</span><b>¥{{ ttl.toLocaleString() }}</b></div>
        </div>

        <div class="pay">
          <label>お預かり</label>
          <input class="inp" type="number" min="0" v-model.number="payAmount" />
          <div class="change">お釣り（概算）：<b>¥{{ Math.max(0, payAmount - ttl).toLocaleString() }}</b></div>
        </div>

        <div class="ops">
          <button class="btn" :disabled="!canCheckout" @click="checkout('cash')">現金会計</button>
          <button class="btn" :disabled="!canCheckout" @click="checkout('card')">カード会計</button>
        </div>
        <p v-if="err" class="err">{{ err }}</p>
      </div>
    </div>

    <!-- レシート -->
    <div v-if="receipt" class="receipt">
      <h3>レシート</h3>
      <div class="rc-head">
        <div>伝票番号：{{ receipt.id }}</div>
        <div>Table {{ receipt.tableName || '-' }}</div>
        <div>{{ receipt.ts }}</div>
        <div>決済：{{ receipt.method === 'cash' ? '現金' : 'カード' }}</div>
      </div>
      <div class="rc-lines">
        <div class="rc-line" v-for="r in receipt.lines" :key="r.menuItemId + ':' + r.idx">
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
import { computed, reactive, ref, onMounted } from "vue";
import api from "@/lib/api";

const tables = ref([]);
const tableId = ref("");

const menu = ref([]);
const keyword = ref("");
const cat = ref("");
const categories = ref([]);

const err = ref("");
const lines = reactive([]);
const payAmount = ref(0);
const receipt = ref(null);

const filteredMenu = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  return menu.value.filter(m => {
    const passCat = !cat.value || m.category === cat.value;
    const passKw = !k || (m.name || "").toLowerCase().includes(k);
    return passCat && passKw;
  });
});

function add(m) {
  const i = lines.findIndex(x => x.menuItemId === m._id && x.price === (m.price||0) && x.name === m.name);
  if (i >= 0) lines[i].qty++;
  else lines.push({
    menuItemId: m._id,
    name: m.name,
    category: m.category,
    price: m.price || 0,
    qty: 1,
    prepMinutes: m.prepMinutes || 10,
  });
}
function inc(i){ lines[i].qty++; }
function dec(i){ lines[i].qty = Math.max(1, lines[i].qty-1); }
function remove(i){ lines.splice(i,1); }
function clearCart(){ lines.splice(0, lines.length); tableId.value=""; payAmount.value=0; err.value=""; }

const sub = computed(() => lines.reduce((a,i)=> a + (i.price*i.qty), 0));
const tx  = computed(() => 0); // 税計算はバックエンドで実装予定
const ttl = computed(() => sub.value + tx.value);
const canCheckout = computed(() => lines.length > 0);

async function loadTables() {
  const { data } = await api.get("/api/tables");
  tables.value = data?.value || [];
}

async function loadMenu() {
  const { data } = await api.get("/api/menu");
  menu.value = data || [];
  categories.value = Array.from(new Set(menu.value.map(m => m.category).filter(Boolean)));
}

async function checkout(method) {
  try {
    err.value = "";
    // 1) 注文起票
    const { data: order } = await api.post("/api/orders", {
      tableId: tableId.value || undefined,
      items: lines.map(l => ({
        menuItemId: l.menuItemId,
        qty: l.qty,
        price: l.price,
        name: l.name,
        category: l.category,
        prepMinutes: l.prepMinutes,
      })),
    });

    // 2) 会計（釣銭判定はサーバ側）
    const payments = [{ method, amount: payAmount.value || ttl.value }];
    const payRes = await api.post(`/api/orders/${order._id}/pay`, { payments });

    // 3) レシート表示
    receipt.value = {
      id: order._id,
      method,
      tableName: tables.value.find(t => t._id === order.tableId)?.name || "",
      ts: new Date().toLocaleString("ja-JP"),
      lines: lines.map((l, idx) => ({ ...l, idx })),
      sub: order.subtotal || sub.value,
      tax: order.tax || 0,
      total: order.total || ttl.value,
    };

    clearCart();
  } catch (e) {
    err.value = e?.response?.data?.message || "会計処理に失敗しました";
  }
}

function closeReceipt(){ receipt.value = null; }
function printReceipt(){ window.print(); }

onMounted(async () => {
  await Promise.all([loadMenu(), loadTables()]);
});
</script>

<style src="../../styles/pages/POS.css"></style>
