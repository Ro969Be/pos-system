<!-- ==========================================================
CustomerDetail.vue
--------------------------------------------------------------
顧客詳細画面
- 基本情報（属性・電話・ポイント）
- 直近5回の来店履歴
- メモ追記
----------------------------------------------------------- -->
<template>
  <div class="customer-detail" v-if="customer">
    <h2>顧客詳細</h2>

    <div class="box">
      <p><b>氏名:</b> {{ customer.name }}</p>
      <p><b>電話:</b> {{ customer.phone || "未登録" }}</p>
      <p><b>来店回数:</b> {{ customer.visitCount || 0 }}</p>
      <p><b>前回来店:</b> {{ formatDate(customer.lastVisit) }}</p>
      <p><b>ポイント:</b> {{ customer.points || 0 }}</p>
      <button @click="addPoints(+10)">+10pt</button>
      <button @click="addPoints(-10)">-10pt</button>
    </div>

    <div class="box">
      <h3>直近5回の来店履歴</h3>
      <ul>
        <li v-for="(h, idx) in history" :key="idx">
          <b>{{ formatDate(h.date) }}</b> / 注文ID: {{ h.orderId }} / 合計: ¥{{ h.total?.toLocaleString() || 0 }}
        </li>
      </ul>
    </div>

    <div class="box">
      <h3>メモ</h3>
      <pre class="memo">{{ customer.memo || "（なし）" }}</pre>
      <textarea v-model="memo" placeholder="追記メモ"></textarea>
      <button @click="appendMemo">メモを追記</button>
    </div>
  </div>
  <p v-else>読み込み中...</p>
</template>

<script>
import axios from "axios";

export default {
  name: "CustomerDetail",
  data() {
    return {
      customer: null,
      history: [],
      memo: "",
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    const { data } = await axios.get(`/api/customers/${id}`);
    this.customer = data;

    const res = await axios.get(`/api/customers/${id}/recent-history`);
    this.history = res.data;
  },
  methods: {
    formatDate(d) {
      if (!d) return "-";
      return new Date(d).toLocaleString();
      },
    async appendMemo() {
      const id = this.customer._id;
      await axios.post(`/api/customers/${id}/memo`, { memo: this.memo });
      const { data } = await axios.get(`/api/customers/${id}`);
      this.customer = data;
      this.memo = "";
      alert("メモを追記しました。");
    },
    async addPoints(delta) {
      const id = this.customer._id;
      await axios.post(`/api/customers/${id}/points`, { delta });
      const { data } = await axios.get(`/api/customers/${id}`);
      this.customer = data;
    },
  },
};
</script>

<style scoped>
.customer-detail {
  padding: 20px;
}
.box {
  border: 1px solid #ddd;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 6px;
  background: #fff;
}
.memo {
  background: #f7f7f7;
  padding: 8px;
  border-radius: 4px;
  min-height: 60px;
  white-space: pre-wrap;
}
textarea {
  width: 100%;
  min-height: 80px;
  margin-top: 8px;
  margin-bottom: 8px;
}
button {
  margin-right: 8px;
}
</style>
