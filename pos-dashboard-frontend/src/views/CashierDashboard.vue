<template>
  <div class="cashier">
    <header>
      <h2>💴 レジ端末モード</h2>
      <button @click="reset">🔄 リセット</button>
    </header>

    <section class="order-info">
      <h3>会計情報</h3>
      <label>伝票番号:</label>
      <input v-model="orderId" placeholder="例: 65231fa..." />

      <label>合計金額:</label>
      <input type="number" v-model.number="total" placeholder="3000" />

      <div class="payments">
        <h4>支払い入力</h4>
        <div v-for="(p, idx) in payments" :key="idx" class="row">
          <select v-model="p.methodName">
            <option disabled value="">決済方法を選択</option>
            <option v-for="m in methods" :value="m.displayName" :key="m._id">{{ m.displayName }}</option>
          </select>
          <input type="number" v-model.number="p.amount" placeholder="金額" min="0" />
          <button @click="removePayment(idx)">削除</button>
        </div>

        <div class="quick-buttons">
          <button @click="addQuick('現金')">＋ 現金</button>
          <button @click="addQuick('PayPay')">＋ PayPay</button>
          <button @click="addQuick('カード')">＋ カード</button>
        </div>
      </div>

      <div class="summary">
        <p>支払い合計：¥{{ totalPaid.toLocaleString() }}</p>
        <p v-if="change > 0" class="ok">お釣り：¥{{ change.toLocaleString() }}</p>
        <p v-if="error" class="warn">⚠️ {{ error }}</p>
      </div>

      <button class="confirm" :disabled="!isValid" @click="closeOrder">会計確定</button>
      <button v-if="completedOrder" class="receipt" @click="generateReceipt">
        🧾 領収書発行
      </button>
    </section>

    <section class="history">
      <h3>🗂 今日の会計履歴</h3>
      <table>
        <thead>
          <tr>
            <th>伝票</th>
            <th>合計</th>
            <th>支払い内訳</th>
            <th>お釣り</th>
            <th>時刻</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in history" :key="o._id">
            <td>{{ o._id.slice(-5) }}</td>
            <td>¥{{ o.totalPrice.toLocaleString() }}</td>
            <td>{{ formatPayments(o.payments) }}</td>
            <td>¥{{ o.change?.toLocaleString() || 0 }}</td>
            <td>{{ new Date(o.createdAt).toLocaleTimeString() }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CashierDashboard",
  data() {
    return {
      orderId: "",
      total: 0,
      payments: [],
      methods: [],
      change: 0,
      error: "",
      completedOrder: null,
      history: [],
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
      return !this.error && this.total > 0 && this.totalPaid >= this.total;
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
    await this.loadMethods();
    await this.loadHistory();
  },
  methods: {
    async loadMethods() {
      const { data } = await axios.get("/api/payments/methods");
      this.methods = data;
    },
    async loadHistory() {
      const { data } = await axios.get("/api/sales/today");
      if (data.orders) this.history = data.orders;
    },
    addQuick(name) {
      this.payments.push({ methodName: name, amount: 0 });
    },
    removePayment(i) {
      this.payments.splice(i, 1);
      this.validatePayments();
    },
    validatePayments() {
      this.error = "";
      this.change = 0;
      const diff = this.totalPaid - this.total;

      if (diff < 0) {
        this.error = "支払いが不足しています。";
        return;
      }
      if (diff === 0) return;

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
        this.completedOrder = data.order;
        this.change = data.change;
        alert(`✅ 会計完了：お釣り ¥${data.change.toLocaleString()}`);
        await this.loadHistory();
      } catch (err) {
        this.error = err.response?.data?.message || err.message;
      }
    },
    async generateReceipt() {
      if (!this.completedOrder) return;
      const res = await axios.post(
        `/api/payments/receipt/${this.completedOrder._id}`,
        { to: "お客様", note: "飲食代として" },
        { responseType: "blob" }
      );
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    },
    formatPayments(payments) {
      return payments.map((p) => `${p.methodName}: ¥${p.amount}`).join(", ");
    },
    reset() {
      this.orderId = "";
      this.total = 0;
      this.payments = [];
      this.completedOrder = null;
      this.change = 0;
      this.error = "";
      this.addQuick("現金");
    },
  },
};
</script>

<style scoped>
.cashier {
  padding: 20px;
  background: #f9fafc;
  max-width: 900px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-info {
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}
.quick-buttons button {
  margin-right: 5px;
}
.confirm {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
}
.receipt {
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 10px;
}
.warn {
  color: red;
  font-weight: bold;
}
.ok {
  color: #007bff;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background: #f2f2f2;
}
</style>
