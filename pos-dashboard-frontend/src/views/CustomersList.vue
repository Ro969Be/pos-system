<!-- ==========================================================
CustomersList.vue
--------------------------------------------------------------
顧客一覧・検索画面
- 一覧表示
- 名前/電話番号検索
- 詳細画面へのリンク
----------------------------------------------------------- -->
<template>
  <div class="customers-list">
    <h2>顧客一覧</h2>

    <div class="search">
      <input v-model="q" placeholder="名前で検索" @input="filterByName" />
      <input v-model="phone" placeholder="電話番号検索" />
      <button @click="searchByPhone">電話番号で検索</button>
    </div>

    <ul>
      <li v-for="c in filtered" :key="c._id">
        <router-link :to="`/customers/${c._id}`">
          {{ c.name }}（{{ c.phone || "電話未登録" }}） / 来店回数: {{ c.visitCount || 0 }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CustomersList",
  data() {
    return {
      all: [],
      filtered: [],
      q: "",
      phone: "",
    };
  },
  async mounted() {
    const { data } = await axios.get("/api/customers");
    this.all = data;
    this.filtered = data;
  },
  methods: {
    filterByName() {
      const q = this.q.toLowerCase();
      this.filtered = this.all.filter((c) => c.name.toLowerCase().includes(q));
    },
    async searchByPhone() {
      const { data } = await axios.get("/api/customers/search/phone", {
        params: { phone: this.phone },
      });
      if (data) {
        this.filtered = [data];
      } else {
        alert("該当する電話番号の顧客はいません。");
      }
    },
  },
};
</script>

<style scoped>
.customers-list {
  padding: 20px;
}
.search {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 6px;
}
</style>
