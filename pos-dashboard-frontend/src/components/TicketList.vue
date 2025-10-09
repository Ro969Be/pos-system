<script setup lang="ts">
import { useTicketStore } from "@/stores/tickets";
import { useProductStore } from "@/stores/products";
import { ref, onMounted, computed } from "vue";

const ticketStore = useTicketStore();
const productStore = useProductStore();

const addingTicketId = ref<string | null>(null);
const selectedProduct = ref<{
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock?: number | null
} | null>(null);
const draftItems = ref<{ product: any; quantity: number; notes: string }[]>([]);

const quantity = ref<number>(1);
const notes = ref<string>("");

onMounted(() => {
  ticketStore.fetchTickets();
  productStore.fetchProducts();
});

function startAdding(ticketId: string) {
  addingTicketId.value = ticketId;
  selectedProduct.value = null;
  quantity.value = 1;
  notes.value = "";
}

function openProductInput(product: any) {
  selectedProduct.value = product;
  quantity.value = 1;
  notes.value = "";
}

// 🔹 在庫の上限を計算（在庫未設定なら無制限 Infinity）
const maxQuantity = computed(() => {
  return selectedProduct.value?.stock ?? Infinity;
});

function changeQuantity(delta: number) {
  const maxStock = selectedProduct.value?.stock ?? Infinity;
  const newVal = quantity.value + delta;
  if (newVal >= 1 && newVal <= maxStock) {
    quantity.value = Math.floor(newVal); // 整数に補正
  }
}

function onQuantityInput() {
  const maxStock = selectedProduct.value?.stock ?? Infinity;
  if (quantity.value < 1) {
    quantity.value = 1;
  } else if (quantity.value > maxStock) {
    quantity.value = maxStock;
  }
  quantity.value = Math.floor(quantity.value); // 小数は切り捨て
}

async function confirmAdd() {
  if (!addingTicketId.value || !selectedProduct.value) return;

  await ticketStore.addItem(addingTicketId.value, {
    product: selectedProduct.value._id,
    quantity: quantity.value,
    notes: notes.value
  });

  // リセットして閉じる
  addingTicketId.value = null;
  selectedProduct.value = null;
}

function addToDraft() {
  if (!selectedProduct.value) return;
  draftItems.value.push({
    product: selectedProduct.value,
    quantity: quantity.value,
    notes: notes.value,
  });
  // 入力リセット
  selectedProduct.value = null;
  quantity.value = 1;
  notes.value = "";
}

function handleClose() {
  if (draftItems.value.length > 0) {
    if (window.confirm("積み上げた商品は破棄されます。よろしいですか？")) {
      addingTicketId.value = null;
      draftItems.value = [];
    }
  } else {
    addingTicketId.value = null;
    draftItems.value = [];
  }
}

async function confirmDraft() {
  if (!addingTicketId.value || draftItems.value.length === 0) return;

  for (const item of draftItems.value) {
    await ticketStore.addItem(addingTicketId.value, {
      product: item.product._id,
      quantity: item.quantity,
      notes: item.notes,
    });
  }

  // 全部送信したらリセット
  draftItems.value = [];
  addingTicketId.value = null;
}

// 🔹 Draftから削除
function removeDraftItem(index: number) {
  draftItems.value.splice(index, 1);
}
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <div v-for="ticket in ticketStore.tickets" :key="ticket._id"
         class="p-4 bg-white shadow rounded-xl flex flex-col">
      <h3 class="text-lg font-bold">伝票 #{{ ticket._id.slice(-4) }}</h3>
      <p>テーブル: {{ ticket.tableNumber ?? "未指定" }}</p>
      <p>担当: {{ ticket.staff ?? "-" }}</p>

      <ul class="mb-2">
        <li v-for="item in ticket.items" :key="item._id">
          {{ item.product?.name }} x{{ item.quantity }}
          <span v-if="item.notes"> ({{ item.notes }})</span>
        </li>
      </ul>

      <div class="mt-auto flex gap-2">
        <button @click="startAdding(ticket._id)" class="bg-blue-500 text-white px-2 py-1 rounded">商品追加</button>
        <button @click="ticketStore.closeTicket(ticket._id)" class="bg-green-500 text-white px-2 py-1 rounded">会計</button>
        <button @click="ticketStore.cancelTicket(ticket._id)" class="bg-red-500 text-white px-2 py-1 rounded">キャンセル</button>
      </div>
    </div>
  </div>

  <!-- 🔹 商品カード一覧モーダル -->
  <div v-if="addingTicketId && !selectedProduct" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
    <div class="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-4xl">
      <h2 class="text-xl font-bold mb-4">商品を選択</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="p in productStore.products" :key="p._id"
            @click="(p.stock ?? Infinity) > 0 && openProductInput(p)"
            :class="[ 
            'rounded-xl shadow p-4 flex flex-col items-center transition',
            (p.stock ?? Infinity) > 0 
                ? 'cursor-pointer bg-gray-100 hover:shadow-lg' 
                : 'bg-gray-200 opacity-50 cursor-not-allowed'
            ]">
            <img v-if="p.imageUrl" :src="p.imageUrl" class="w-24 h-24 object-cover rounded-lg mb-2" />
            <div class="text-center font-bold">{{ p.name }}</div>
            <div class="text-gray-600">¥{{ p.price }}</div>
            <div v-if="(p.stock ?? Infinity) === 0" class="text-red-500 text-sm mt-1">在庫切れ</div>
        </div>
      </div>

      <!-- 🔹 積み上げた商品一覧 -->
      <div v-if="draftItems.length" class="mt-6 border-t pt-4">
        <h3 class="font-bold mb-2">追加予定の商品</h3>
        <ul class="mb-2 space-y-1">
          <li v-for="(item, i) in draftItems" :key="i" class="flex justify-between items-center">
            <div>
              {{ item.product.name }} x{{ item.quantity }}
              <span v-if="item.notes">({{ item.notes }})</span>
            </div>
            <button @click="removeDraftItem(i)" class="text-red-500 hover:text-red-700">×</button>
          </li>
        </ul>
        <button @click="confirmDraft" class="w-full px-4 py-2 bg-green-600 text-white rounded">
          まとめて追加
        </button>
      </div>

      <div class="mt-4 flex justify-end">
        <!-- 🔹 draftItemsもリセットする -->
        <button 
            @click="handleClose" 
            class="px-4 py-2 bg-gray-400 text-white rounded">
            閉じる
        </button>
      </div>
    </div>
  </div>

  <!-- 🔹 数量・メモ入力モーダル -->
  <div v-if="selectedProduct" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
    <div class="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
      <h2 class="text-xl font-bold mb-4">{{ selectedProduct.name }}</h2>

      <!-- 数量入力 -->
      <div class="flex items-center justify-center mb-4">
        <button @click="changeQuantity(-1)" class="px-4 py-2 bg-gray-300 rounded-l-lg">－</button>
        <input type="number" v-model.number="quantity" min="1"
       :max="selectedProduct?.stock ?? undefined"
       class="w-20 text-center border-t border-b"
       @input="onQuantityInput" />
        <button @click="changeQuantity(1)" class="px-4 py-2 bg-gray-300 rounded-r-lg">＋</button>
      </div>

      <!-- メモ入力 -->
      <textarea v-model="notes" placeholder="メモ（例: 氷なし、大盛り）"
                class="w-full border p-2 rounded mb-4"></textarea>

      <div class="flex justify-between">
        <button @click="selectedProduct = null" class="px-4 py-2 bg-gray-400 text-white rounded">戻る</button>
        <button @click="addToDraft" class="px-4 py-2 bg-blue-500 text-white rounded">追加</button>
      </div>
    </div>
  </div>
</template>
