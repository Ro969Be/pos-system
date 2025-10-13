<!-- レジ開閉・締め -->
<template>
  <div class="cash">
    <h2>レジ開閉・締め</h2>

    <div class="box">
      <h3>レジ開始</h3>
      <input type="number" v-model.number="openingCash" placeholder="開店時レジ現金" />
      <input v-model="openedBy" placeholder="開始担当者" />
      <button @click="open">開始</button>
    </div>

    <div class="box">
      <h3>当日サマリ</h3>
      <p>営業日: {{ summary.businessDate }}</p>
      <p>現金売上（集計）: ¥{{ summary.cashSales?.toLocaleString() || 0 }}</p>
      <p v-if="summary.session">開始現金: ¥{{ summary.session.openingCash }}</p>
    </div>

    <div class="box">
      <h3>レジ締め</h3>
      <input type="number" v-model.number="closingCash" placeholder="閉店時レジ現金" />
      <input v-model="closedBy" placeholder="締め担当者" />
      <button @click="close">締める</button>
      <div v-if="closedSession">
        <p>期待現金: ¥{{ closedSession.expectedCash.toLocaleString() }}</p>
        <p>実在現金: ¥{{ closedSession.closingCash.toLocaleString() }}</p>
        <p>差異(Over/Short): ¥{{ closedSession.overShort.toLocaleString() }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "CashClose",
  data() {
    return {
      openingCash: 0,
      openedBy: "",
      closingCash: 0,
      closedBy: "",
      summary: {},
      closedSession: null,
    };
  },
  async mounted() { await this.loadSummary(); },
  methods: {
    async loadSummary() {
      const { data } = await axios.get("/api/cash-sessions/today");
      this.summary = data;
    },
    async open() {
      await axios.post("/api/cash-sessions/open", {
        openingCash: this.openingCash,
        openedBy: this.openedBy,
      });
      await this.loadSummary();
      alert("レジを開始しました");
    },
    async close() {
      if (!this.summary.session?._id) { alert("レジ開始が必要です"); return; }
      const { data } = await axios.post(`/api/cash-sessions/close/${this.summary.session._id}`, {
        closingCash: this.closingCash,
        closedBy: this.closedBy,
      });
      this.closedSession = data;
      await this.loadSummary();
      alert("レジを締めました");
    },
  },
};
</script>

<style scoped>
.cash { padding: 20px; max-width: 640px; }
.box { background: #fff; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
</style>
