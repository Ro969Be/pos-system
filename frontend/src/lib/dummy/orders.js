// src/lib/dummy/orders.js
// ✅ 商品(item)単位でステータス管理 / KitchenとHallで別フィルタを保存

const ORDERS_KEY = "pos_dummy_orders_v2";
const FILTER_KEY_KITCHEN = "pos_filter_kitchen";
const FILTER_KEY_HALL = "pos_filter_hall";

// 商品単位の seed（各 item に status を付与）
const seed = [
  {
    id: "A-101",
    table: "A1",
    createdAt: Date.now() - 1000 * 60 * 18,
    slaMin: 15,
    items: [
      {
        name: "唐揚げ",
        station: "kitchen",
        category: "揚げ物",
        status: "pending",
      },
      {
        name: "ポテト",
        station: "kitchen",
        category: "揚げ物",
        status: "pending",
      },
      {
        name: "レモンサワー",
        station: "drinker",
        category: "アルコール",
        status: "pending",
      },
    ],
    notes: "",
  },
  {
    id: "B-203",
    table: "B2",
    createdAt: Date.now() - 1000 * 60 * 5,
    slaMin: 12,
    items: [
      {
        name: "ナポリタン",
        station: "kitchen",
        category: "麺",
        status: "pending",
      },
      {
        name: "サラダ",
        station: "kitchen",
        category: "サラダ",
        status: "pending",
      },
    ],
    notes: "小辛",
  },
  {
    id: "C-305",
    table: "C3",
    createdAt: Date.now() - 1000 * 60 * 25,
    slaMin: 20,
    items: [
      {
        name: "ビール",
        station: "drinker",
        category: "アルコール",
        status: "cooking",
      },
    ],
    notes: "",
  },
];

export function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(seed));
      return structuredClone(seed);
    }
    return JSON.parse(raw);
  } catch {
    return structuredClone(seed);
  }
}

export function saveOrders(list) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}

export function resetOrders() {
  localStorage.removeItem(ORDERS_KEY);
}

// ✅ item 単位の更新（orderId と itemIndex で特定）
export function updateItem(orderId, itemIndex, updater) {
  const list = loadOrders();
  const oi = list.findIndex((o) => o.id === orderId);
  if (oi === -1) return;
  const order = { ...list[oi] };
  const items = [...order.items];
  const item = { ...items[itemIndex] };
  updater(item);
  items[itemIndex] = item;
  order.items = items;
  list[oi] = order;
  saveOrders(list);
  return item;
}

// ✅ カテゴリ一覧（全 item から収集）
export function getAllCategories() {
  const set = new Set();
  for (const o of loadOrders()) {
    for (const it of o.items || []) {
      if (it.category) set.add(it.category);
    }
  }
  return Array.from(set);
}

// ✅ フィルタ保存/読込（Kitchen/Hall でキーを分ける）
export function loadCategoryFilter(scope /* 'kitchen' | 'hall' */) {
  const key = scope === "hall" ? FILTER_KEY_HALL : FILTER_KEY_KITCHEN;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw); // 例: { "揚げ物": true, "アルコール": false }
  } catch {
    return null;
  }
}

export function saveCategoryFilter(scope, map) {
  const key = scope === "hall" ? FILTER_KEY_HALL : FILTER_KEY_KITCHEN;
  localStorage.setItem(key, JSON.stringify(map));
}
