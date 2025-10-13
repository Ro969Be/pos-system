<template>
  <div class="payment-screen">
    <h2>会計画面</h2>

    <div class="info">
      <p>伝票ID: {{ orderId }}</p>
      <p>合計金額: ¥{{ total.toLocaleString() }}</p>
    </div>

    <h3>支払い入力</h3>
    <div v-for="(p, idx) in payments" :key="idx" class="row">
      <select v-model="p.methodId">
        <option disabled value="">決済方法を選択</option>
        <option v-for="m in methods" :value="m._id" :key="m._id">{{ m.displayName }}</option>
      </select>
      <input type="number" v-model.number="p.amount" placeholder="金額" />
      <button @click="removePayment(idx)">削除</button>
    </div>
    <button @click="addPayment">＋支払い追加</button>

    <div class="summary">
      <p>支払い合計: ¥{{ totalPaid.toLocaleString() }}</p>
      <p v-if="!isMatch" class="warn">⚠️ 支払い合計が一致していません</p>
    </div>

    <button @click="closeOrder" :disabled="!isMatch">会計確定</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaymentScreen",
  props: ["orderId", "total"],
  data() {
    return { methods: [], payments: [] };
  },
  computed: {
    totalPaid() {
      return this.payments.reduce((s, p) => s + (p.amount || 0), 0);
    },
    isMatch() {
      return Math.abs(this.total - this.totalPaid) < 1;
    },
  },
  async mounted() {
    const { data } = await axios.get("/api/payments/methods");
    this.methods = data;
    this.addPayment();
  },
  methods: {
    addPayment() {
      this.payments.push({ methodId: "", amount: 0 });
    },
    removePayment(i) {
      this.payments.splice(i, 1);
    },
    async closeOrder() {
      await axios.post(`/api/payments/close/${this.orderId}`, { payments: this.payments });
      alert("会計完了しました。領収書を発行します。");
      this.$router.push(`/receipt/${this.orderId}`);
    },
  },
};
</script>

<style scoped>
.payment-screen {
  padding: 20px;
  max-width: 600px;
}
.row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.warn {
  color: red;
}
button {
  margin-top: 10px;
}
</style>
