<template>
  <div class="payment-screen">
    <h2>会計画面</h2>

    <div class="info">
      <p>伝票ID: {{ orderId }}</p>
      <p>合計金額: ¥{{ total.toLocaleString() }}</p>
    </div>

    <h3>支払い入力</h3>
    <div
      v-for="(p, idx) in payments"
      :key="idx"
      class="row"
    >
      <select v-model="p.methodName">
        <option disabled value="">決済方法を選択</option>
        <option v-for="m in methods" :value="m.displayName" :key="m._id">{{ m.displayName }}</option>
      </select>
      <input type="number" v-model.number="p.amount" placeholder="金額" min="0" />
      <button @click="removePayment(idx)">削除</button>
    </div>
    <button @click="addPayment">＋支払い追加</button>

    <hr />

    <div class="summary">
      <p>支払い合計：¥{{ totalPaid.toLocaleString() }}</p>
      <p v-if="change > 0" class="ok">お釣り：¥{{ change.toLocaleString() }}</p>
      <p v-if="error" class="warn">⚠️ {{ error }}</p>
    </div>

    <button
      @click="closeOrder"
      :disabled="!isValid"
      class="confirm"
    >
      会計確定
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaymentScreen",
  props: {
    orderId: { type: String, required: true },
    total: { type: Number, required: true },
  },
  data() {
    return {
      methods: [],
      payments: [],
      error: "",
      change: 0,
    };
  },
  computed: {
    totalPaid() {
      return this.payments.reduce((s, p) => s + (p.amount || 0), 0);
    },
    cashAmount() {
      const cash = this.payments.find((p) => p.methodName === "現金" || p.methodName === "CASH");
      return cash ? cash.amount : 0;
    },
    isValid() {
      return !this.error && this.totalPaid >= this.total;
    },
  },
  watch: {
    payments: {
      deep: true,
      handler() {
        this.validatePayments();
      },
    },
  },
  async mounted() {
    const { data } = await axios.get("/api/payments/methods");
    this.methods = data;
    this.addPayment();
  },
  methods: {
    addPayment() {
      this.payments.push({ methodName: "", amount: 0 });
    },
    removePayment(i) {
      this.payments.splice(i, 1);
      this.validatePayments();
    },
    /**
     * ローカル側で支払いチェック（バックエンドと同じロジック）
     */
    validatePayments() {
      this.error = "";
      this.change = 0;
      const diff = this.totalPaid - this.total;

      if (diff < 0) {
        this.error = "支払いが不足しています。";
        return;
      }
      if (diff === 0) {
        return; // お釣りなしOK
      }

      // 過剰支払い
      const hasCash = this.cashAmount > 0;
      if (!hasCash) {
        this.error = "現金が含まれていないため、過剰支払いはできません。";
        return;
      }

      if (diff > this.cashAmount) {
        this.error = "現金額が過剰分をカバーできません（お釣り不足）。";
        return;
      }

      this.change = diff;
    },
    async closeOrder() {
      try {
        const { data } = await axios.post(`/api/payments/close/${this.orderId}`, {
          payments: this.payments.map((p) => ({
            methodName: p.methodName,
            amount: p.amount,
          })),
        });
        alert(`会計完了しました。お釣り：¥${data.change}`);
        this.$router.push(`/receipt/${this.orderId}`);
      } catch (err) {
        alert("エラー：" + err.response?.data?.message || err.message);
      }
    },
  },
};
</script>

<style scoped>
.payment-screen {
  padding: 20px;
  max-width: 600px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
}
.row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  align-items: center;
}
hr {
  margin: 15px 0;
}
.warn {
  color: red;
  font-weight: bold;
}
.ok {
  color: #007bff;
}
.confirm {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}
.confirm:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>
