<!-- ==========================================================
PaymentSplitView.vue
--------------------------------------------------------------
個別会計画面（分割支払い対応）
----------------------------------------------------------- -->
<template>
  <div class="split-payment">
    <h2>個別会計</h2>

    <div v-if="order">
      <ul>
        <li v-for="(item, index) in order.items" :key="index">
          {{ item.product.name }} × {{ item.quantity }}
        </li>
      </ul>

      <h3>分割設定</h3>
      <div v-for="(s, idx) in splits" :key="idx">
        <input v-model="s.label" placeholder="名前" />
        <input v-model.number="s.amount" type="number" placeholder="金額" />
      </div>

      <button @click="addSplit">＋追加</button>
      <button @click="saveSplit">💾 保存</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "PaymentSplitView",
  data() {
    return {
      order: null,
      splits: [],
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    const { data } = await axios.get(`/api/orders/${id}`);
    this.order = data;
  },
  methods: {
    addSplit() {
      this.splits.push({ label: "", amount: 0 });
    },
    async saveSplit() {
      const id = this.order._id;
      await axios.put(`/api/orders/${id}`, { splitPayments: this.splits });
      alert("分割支払いを保存しました。");
    },
  },
};
</script>

<style scoped>
.split-payment {
  padding: 20px;
}
input {
  margin: 4px;
}
</style>
