<!-- ==========================================================
TableLayout.vue
--------------------------------------------------------------
テーブル（座席）レイアウト編集＆在席管理
- 一覧表示
- ドラッグで座標変更 → 保存
- 状態変更（vacant / reserved / occupied）
----------------------------------------------------------- -->
<template>
  <div class="layout">
    <h2>テーブルレイアウト</h2>

    <div class="toolbar">
      <button @click="fetchTables">再読込</button>
      <button @click="addTable">テーブル追加</button>
    </div>

    <div class="canvas" ref="canvas">
      <div
        v-for="t in tables"
        :key="t._id"
        class="table"
        :class="t.status"
        :style="{ left: t.layout.x + 'px', top: t.layout.y + 'px' }"
        draggable="true"
        @dragstart="onDragStart($event, t)"
        @dragend="onDragEnd($event, t)"
      >
        <div class="name">{{ t.name }}</div>
        <div class="capacity">{{ t.capacity }}</div>
        <select v-model="t.status" @change="updateStatus(t)">
          <option value="vacant">空席</option>
          <option value="reserved">予約</option>
          <option value="occupied">在席</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TableLayout",
  data() {
    return {
      tables: [],
      dragOffset: { x: 0, y: 0 },
    };
  },
  async mounted() {
    await this.fetchTables();
  },
  methods: {
    async fetchTables() {
      const { data } = await axios.get("/api/tables");
      this.tables = data;
    },
    async addTable() {
      const name = prompt("テーブル名");
      const cap = Number(prompt("座席数", "4"));
      if (!name || !cap) return;
      await axios.post("/api/tables", { name, capacity: cap, type: "table" });
      await this.fetchTables();
    },
    onDragStart(e, t) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left - t.layout.x;
      this.dragOffset.y = e.clientY - rect.top - t.layout.y;
    },
    async onDragEnd(e, t) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - this.dragOffset.x;
      const y = e.clientY - rect.top - this.dragOffset.y;
      await axios.put(`/api/tables/${t._id}/layout`, { x: Math.max(0, x), y: Math.max(0, y) });
      await this.fetchTables();
    },
    async updateStatus(t) {
      await axios.put(`/api/tables/${t._id}/status`, { status: t.status, currentReservation: t.currentReservation });
      await this.fetchTables();
    },
  },
};
</script>

<style scoped>
.layout {
  padding: 20px;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.canvas {
  position: relative;
  width: 100%;
  height: 600px;
  background: #f5f5f7;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
.table {
  position: absolute;
  width: 90px;
  height: 70px;
  background: #fff;
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 6px;
  user-select: none;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.table .name {
  font-weight: bold;
}
.table .capacity {
  font-size: 12px;
}
.table.vacant {
  border-color: #0aa50a;
  box-shadow: 0 0 0 2px rgba(10, 165, 10, 0.1);
}
.table.reserved {
  border-color: #ff9f00;
  box-shadow: 0 0 0 2px rgba(255, 159, 0, 0.12);
}
.table.occupied {
  border-color: #e03131;
  box-shadow: 0 0 0 2px rgba(224, 49, 49, 0.12);
}
select {
  width: 100%;
}
</style>
