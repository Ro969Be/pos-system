<!-- ==========================================================
ReceiptView.vue
--------------------------------------------------------------
領収書発行画面
- 宛名・但し書き・インボイス番号の入力/保存
- PDFプレビュー（iframe）
----------------------------------------------------------- -->

<template>
  <div class="receipt-view">
    <h2>🧾 領収書発行</h2>

    <div v-if="ticket">
      <p><b>伝票番号:</b> {{ ticket._id }}</p>
      <p><b>ステータス:</b> {{ ticket.status }}</p>

      <div class="form-section">
        <label>宛名:</label>
        <input v-model="form.receiptName" placeholder="例：株式会社〇〇 様" />

        <label>但し書き:</label>
        <input v-model="form.receiptNote" placeholder="例：飲食代として" />

        <label>インボイス番号:</label>
        <input
          v-model="form.invoiceNumber"
          placeholder="例：T1234567890123"
        />

        <button @click="updateReceipt">💾 保存</button>
      </div>

      <hr />
      <button @click="loadPDF">📄 PDFを生成して表示</button>

      <iframe
        v-if="pdfUrl"
        :src="pdfUrl"
        class="pdf-frame"
        title="領収書PDF"
      ></iframe>
    </div>

    <p v-else>読み込み中...</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ReceiptView",
  data() {
    return {
      ticket: null,
      form: { receiptName: "", receiptNote: "", invoiceNumber: "" },
      pdfUrl: null,
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    const { data } = await axios.get(`/api/tickets/${id}`);
    this.ticket = data;
    this.form = {
      receiptName: data.receiptName || "",
      receiptNote: data.receiptNote || "",
      invoiceNumber: data.invoiceNumber || "",
    };
  },
  methods: {
    async updateReceipt() {
      const id = this.ticket._id;
      await axios.put(`/api/tickets/${id}/receipt-info`, this.form);
      alert("領収書情報を更新しました。");
    },
    loadPDF() {
      const id = this.ticket._id;
      this.pdfUrl = `/api/tickets/${id}/receipt`;
    },
  },
};
</script>

<style scoped>
.receipt-view {
  padding: 20px;
}
.form-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pdf-frame {
  width: 100%;
  height: 500px;
  border: 1px solid #ccc;
  margin-top: 10px;
}
button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #3e8e41;
}
</style>
