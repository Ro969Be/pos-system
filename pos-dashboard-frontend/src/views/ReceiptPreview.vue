<template>
  <div class="receipt">
    <h2>領収書発行</h2>
    <form @submit.prevent="generate">
      <label>宛名</label>
      <input v-model="to" placeholder="株式会社〇〇御中" />

      <label>但し書き</label>
      <input v-model="note" placeholder="飲食代として" />

      <button type="submit">PDFを発行</button>
    </form>

    <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="600"></iframe>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ReceiptPreview",
  props: ["orderId"],
  data() {
    return { to: "", note: "", pdfUrl: "" };
  },
  methods: {
    async generate() {
      const res = await axios.post(`/api/payments/receipt/${this.orderId}`, { to: this.to, note: this.note }, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      this.pdfUrl = URL.createObjectURL(blob);
    },
  },
};
</script>

<style scoped>
.receipt {
  padding: 20px;
  max-width: 600px;
}
form {
  display: grid;
  gap: 10px;
}
iframe {
  margin-top: 20px;
  border: 1px solid #ccc;
}
</style>
