<!-- 打刻IN/OUT -->
<template>
  <div class="attendance">
    <h2>勤怠打刻</h2>
    <div class="box">
      <input v-model="staffName" placeholder="氏名" />
      <button @click="clockIn">出勤</button>
      <button :disabled="!currentId" @click="clockOut">退勤</button>
      <p v-if="currentId">打刻中ID: {{ currentId }}</p>
    </div>

    <h3>本日の勤怠</h3>
    <ul>
      <li v-for="a in list" :key="a._id">
        {{ a.staffName }}: IN {{ fmt(a.clockIn) }} / OUT {{ a.clockOut ? fmt(a.clockOut) : "-" }} / {{ a.totalMinutes }}分
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "AttendanceClock",
  data() {
    return { staffName: "", currentId: "", list: [] };
  },
  async mounted() { await this.load(); },
  methods: {
    async load() {
      const { data } = await axios.get("/api/attendances");
      this.list = data;
    },
    async clockIn() {
      const { data } = await axios.post("/api/attendances/clock-in", { staffName: this.staffName });
      this.currentId = data._id;
      await this.load();
    },
    async clockOut() {
      if (!this.currentId) return;
      await axios.post(`/api/attendances/clock-out/${this.currentId}`);
      this.currentId = "";
      await this.load();
    },
    fmt(x) { return new Date(x).toLocaleTimeString(); },
  },
};
</script>

<style scoped>
.attendance { padding: 20px; max-width: 600px; }
.box { background: #fff; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
ul { list-style: none; padding: 0; }
</style>
