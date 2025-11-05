import { reactive, computed, watch } from "vue";

const LS_KEY = "cart.v1";

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function save(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export const cart = reactive({ items: load() });

export const count = computed(() =>
  cart.items.reduce((a, b) => a + (b.qty ?? 1), 0)
);

export const subtotal = computed(() =>
  cart.items.reduce((a, b) => a + (b.price * (b.qty ?? 1)), 0)
);

export const taxRate = 0.10;
export const tax = computed(() => Math.round(subtotal.value * taxRate));
export const total = computed(() => subtotal.value + tax.value);

export const byShop = computed(() => {
  const m = new Map();
  for (const it of cart.items) {
    const key = it.shopId || it.shopName || "default";
    if (!m.has(key)) m.set(key, { shopId: key, shopName: it.shopName ?? key, items: [] });
    m.get(key).items.push(it);
  }
  return Array.from(m.values());
});

export function add(item) {
  const key = item.id;
  const found = cart.items.find(x => x.id === key);
  if (found) {
    found.qty = (found.qty ?? 1) + (item.qty ?? 1);
  } else {
    cart.items.push({ ...item, qty: item.qty ?? 1 });
  }
}

export function setQty(id, qty) {
  const x = cart.items.find(i => i.id === id);
  if (!x) return;
  x.qty = Math.max(1, Math.min(99, Number(qty) || 1));
}

export function remove(id) {
  const i = cart.items.findIndex(x => x.id === id);
  if (i >= 0) cart.items.splice(i, 1);
}

export function clear() {
  cart.items.splice(0, cart.items.length);
}

watch(() => cart.items, (v) => save(v), { deep: true });
