<!-- シフト作成・一覧 -->
<template>
  <div class="planner">
    <h2>シフト管理</h2>
    <form @submit.prevent="create">
      <input v-model="form.staffName" placeholder="氏名" required />
      <input type="date" v-model="form.date" required />
      <label>開始</label>
      <input type="datetime-local" v-model="form.startTime" required />
      <label>終了</label>
      <input type="datetime-local" v-model="form.endTime" required />
      <input v-model="form.role" placeholder="役割（任意）" />
      <button>追加</button>
    </form>

    <ul>
      <li v-for="s in shifts" :key="s._id">
        {{ s.date.slice(0,10) }} / {{ s.staffName }} / {{ formatDT(s.startTime) }} - {{ formatDT(s.endTime) }}
        <button @click="remove(s._id)">削除</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "ShiftPlanner",
  data() {
    return {
      form: { staffName: "", date: "", startTime: "", endTime: "", role: "" },
      shifts: [],
    };
  },
  async mounted() { await this.load(); },
  methods: {
    async load() {
      const from = new Date(); const to = new Date(); to.setDate(to.getDate() + 14);
      const { data } = await axios.get("/api/shifts", {
        params: { from: from.toISOString(), to: to.toISOString() },
      });
      this.shifts = data;
    },
    async create() {
      const payload = {
        ...this.form,
        date: new Date(this.form.date).toISOString(),
        startTime: new Date(this.form.startTime).toISOString(),
        endTime: new Date(this.form.endTime).toISOString(),
      };
      await axios.post("/api/shifts", payload);
      await this.load();
      this.form = { staffName: "", date: "", startTime: "", endTime: "", role: "" };
    },
    async remove(id) {
      await axios.delete(`/api/shifts/${id}`);
      await this.load();
    },
    formatDT(x) { return new Date(x).toLocaleString(); },
  },
};
</script>

<style scoped>
.planner { padding: 20px; max-width: 640px; }
form { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 16px; }
ul { list-style: none; padding: 0; }
li { margin-bottom: 6px; }
</style>
