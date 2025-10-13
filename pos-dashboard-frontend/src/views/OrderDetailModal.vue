<template>
  <div class="modal-overlay">
    <div class="modal">
      <h3>📋 伝票詳細</h3>
      <button class="close" @click="$emit('close')">✖</button>

      <table>
        <thead>
          <tr>
            <th>伝票ID</th>
            <th>顧客</th>
            <th>テーブル</th>
            <th>合計</th>
            <th>商品</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td>{{ o.id }}</td>
            <td>{{ o.customer }}</td>
            <td>{{ o.table }}</td>
            <td>¥{{ o.total.toLocaleString() }}</td>
            <td>
              <ul>
                <li v-for="i in o.items" :key="i.name">
                  {{ i.name }} × {{ i.qty }}
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// ------------------------------------------------------------
// props定義：親コンポーネントから渡される「orders」
// ------------------------------------------------------------
interface OrderItem {
  name: string;
  qty: number;
  price?: number;
}

interface Order {
  id: string;
  customer: string;
  table?: number;
  total: number;
  items: OrderItem[];
}

const props = defineProps<{
  orders: Order[];
}>();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-height: 80%;
  overflow: auto;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
}
.close {
  float: right;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 14px;
}
th,
td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: left;
}
th {
  background: #f5f5f5;
}
ul {
  margin: 0;
  padding-left: 20px;
}
</style>
