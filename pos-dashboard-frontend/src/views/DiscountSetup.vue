<!-- ==========================================================
DiscountSetup.vue
--------------------------------------------------------------
割引設定画面（管理者向け）
----------------------------------------------------------- -->
<template>
  <div class="discount-setup">
    <h2>割引設定</h2>

    <form @submit.prevent="createDiscount">
      <input v-model="form.name" placeholder="割引名" required />
      <select v-model="form.type">
        <option value="fixed">定額</option>
        <option value="percent">割合</option>
      </select>
      <input type="number" v-model.number="form.value" placeholder="値" required />
      <select v-model="form.direction">
        <option value="decrease">割引 (-)</option>
        <option value="increase">割増 (+)</option>
      </select>
      <button type="submit">追加</button>
    </form>

    <ul>
      <li v-for="d in discounts" :key="d._id">
        {{ d.name }} ({{ d.type }}:{{ d.value }}
        {{ d.direction === "decrease" ? "↓" : "↑" }})
        <button @click="removeDiscount(d._id)">削除</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DiscountSetup",
  data() {
    return {
      form: { name: "", type: "fixed", value: 0, direction: "decrease" },
      discounts: [],
    };
  },
  async mounted() {
    await this.loadDiscounts();
  },
  methods: {
    async loadDiscounts() {
      const { data } = await axios.get("/api/discounts");
      this.discounts = data;
    },
    async createDiscount() {
      await axios.post("/api/discounts", this.form);
      this.form = { name: "", type: "fixed", value: 0, direction: "decrease" };
      await this.loadDiscounts();
    },
    async removeDiscount(id) {
      await axios.delete(`/api/discounts/${id}`);
      await this.loadDiscounts();
    },
  },
};
</script>

<style scoped>
.discount-setup {
  padding: 20px;
}
form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 8px;
}
</style>
