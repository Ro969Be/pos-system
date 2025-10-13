<!-- ==========================================================
ReservationForm.vue
--------------------------------------------------------------
予約登録フォーム
- 電話番号で顧客照合
- 人数・日時・コース・メモ入力
- 自動配席（サーバ側）→ 予約作成
----------------------------------------------------------- -->
<template>
  <div class="reservation">
    <h2>予約登録</h2>

    <form @submit.prevent="submit">
      <label>氏名</label>
      <input v-model="form.name" required />

      <label>電話番号</label>
      <input v-model="form.phone" required />

      <label>日時</label>
      <input type="datetime-local" v-model="form.dateTime" required />

      <label>人数</label>
      <input type="number" v-model.number="form.partySize" min="1" required />

      <label>予約種別</label>
      <select v-model="form.courseType">
        <option value="seatOnly">席のみ</option>
        <option value="course">コース</option>
      </select>

      <label>コース名（任意）</label>
      <input v-model="form.courseName" placeholder="例：和食コースA" />

      <label>メモ（任意）</label>
      <textarea v-model="form.notes"></textarea>

      <div class="actions">
        <button type="button" @click="lookup">電話番号で照合</button>
        <button type="submit">予約作成（自動配席）</button>
      </div>
    </form>

    <div v-if="lookupResult" class="lookup">
      <h3>照合結果</h3>
      <p v-if="lookupResult._id">既存顧客が見つかりました：{{ lookupResult.name }}</p>
      <p v-else>該当する顧客は見つかりませんでした。</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ReservationForm",
  data() {
    return {
      form: {
        name: "",
        phone: "",
        dateTime: "",
        partySize: 2,
        courseType: "seatOnly",
        courseName: "",
        notes: "",
      },
      lookupResult: null,
    };
  },
  methods: {
    async lookup() {
      if (!this.form.phone) return;
      const { data } = await axios.get("/api/customers/search/phone", { params: { phone: this.form.phone } });
      this.lookupResult = data;
      if (data && data.name) this.form.name = data.name;
    },
    async submit() {
      const payload = { ...this.form, dateTime: new Date(this.form.dateTime).toISOString() };
      const res = await axios.post("/api/reservations", payload);
      alert("予約を作成しました。\n予約ID: " + res.data._id);
      this.$router.push("/tables"); // レイアウト画面へ遷移（任意）
    },
  },
};
</script>

<style scoped>
.reservation {
  padding: 20px;
  max-width: 520px;
}
form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.lookup {
  margin-top: 16px;
  background: #f7f7f7;
  padding: 10px;
  border-radius: 6px;
}
</style>
