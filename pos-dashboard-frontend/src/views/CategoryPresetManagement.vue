<!-- pos-dashboard-frontend/src/views/CategoryPresetManagement.vue -->
<template>
  <div class="preset-management">
    <h1>カテゴリー提供時間プリセット管理</h1>

    <!-- 新規作成フォーム -->
    <form @submit.prevent="createPreset" class="form">
      <label>カテゴリ名（英語推奨：food, drink, pasta, meat など）</label>
      <input v-model="newPreset.category" placeholder="例: drink" required />

      <label>提供時間（分）</label>
      <input type="number" v-model.number="newPreset.provideTime" min="1" required />

      <label>説明（任意）</label>
      <input v-model="newPreset.description" placeholder="例: ドリンクは早めに" />

      <button type="submit">追加</button>
    </form>

    <hr />

    <!-- 一覧 -->
    <h2>登録済みプリセット</h2>
    <table class="preset-table">
      <thead>
        <tr>
          <th>カテゴリ</th>
          <th>提供時間（分）</th>
          <th>説明</th>
          <th>有効</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in presets" :key="p._id">
          <td>{{ p.category }}</td>
          <td>
            <input type="number" v-model.number="p.provideTime" min="1" @blur="updatePreset(p)" />
          </td>
          <td>
            <input v-model="p.description" @blur="updatePreset(p)" />
          </td>
          <td>
            <input type="checkbox" v-model="p.isActive" @change="updatePreset(p)" />
          </td>
          <td>
            <button @click="deletePreset(p._id)">削除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
// ================================================
// CategoryPresetManagement.vue（Socket自動反映対応）
// - サーバーの categoryPresetChanged を受け取り UI を自動更新
// - 管理APIは protect + adminOnly が適用されている想定（トークンを axios に渡す）
// ================================================
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import api from "@/api/axios";
import { io } from "socket.io-client";

export default defineComponent({
  name: "CategoryPresetManagement",
  setup() {
    // Socket.io 接続（認証が必要ならトークンをクエリ/headersで渡す実装へ拡張）
    const socket = io("http://localhost:5000", {
      // transports: ["websocket"], // 必要なら指定
    });

    const presets = ref<any[]>([]);

    const newPreset = ref({
      category: "",
      provideTime: 10,
      description: "",
    });

    // 一覧取得
    const fetchPresets = async () => {
      try {
        const res = await api.get("/category-presets?activeOnly=true");
        presets.value = res.data;
      } catch (err) {
        console.error("❌ プリセット取得失敗:", err);
      }
    };

    // 作成
    const createPreset = async () => {
      try {
        const res = await api.post("/category-presets", newPreset.value);
        // サーバーが emit するためここで追加する必要はないが、即時性のため追加しても良い
        // presets.value.push(res.data);
        newPreset.value = { category: "", provideTime: 10, description: "" };
        // fetchPresets(); // サーバー通知で更新されるので再取得は不要
      } catch (err: any) {
        console.error("❌ プリセット作成失敗:", err);
        alert(err.response?.data?.message || "作成に失敗しました");
      }
    };

    // 更新（部分更新）
    const updatePreset = async (p: any) => {
      try {
        await api.put(`/category-presets/${p._id}`, {
          provideTime: p.provideTime,
          description: p.description,
          isActive: p.isActive,
        });
        // サーバーが emit するためここで更新する必要はない（ただし即時更新が必要ならローカルで反映）
      } catch (err) {
        console.error("❌ プリセット更新失敗:", err);
        alert("更新に失敗しました");
      }
    };

    // 削除
    const deletePreset = async (id: string) => {
      if (!confirm("本当に削除しますか？")) return;
      try {
        await api.delete(`/category-presets/${id}`);
        // サーバーが emit するため再取得は不要
      } catch (err) {
        console.error("❌ プリセット削除失敗:", err);
        alert("削除に失敗しました");
      }
    };

    // ===== Socket イベント受信で自動反映 =====
    const onCategoryPresetChanged = (payload: any) => {
      // payload: { action: 'create'|'update'|'delete', preset?, presetId? }
      const action = payload.action;
      if (action === "create" && payload.preset) {
        // 既に存在するか確認してから追加（重複防止）
        const exists = presets.value.find((x: any) => x._id === payload.preset._id);
        if (!exists) presets.value.unshift(payload.preset);
      } else if (action === "update" && payload.preset) {
        const idx = presets.value.findIndex((x: any) => x._id === payload.preset._id);
        if (idx !== -1) presets.value[idx] = payload.preset;
        else presets.value.unshift(payload.preset);
      } else if (action === "delete" && payload.presetId) {
        presets.value = presets.value.filter((x: any) => x._id !== payload.presetId);
      }
    };

    onMounted(() => {
      fetchPresets();

      // Socket イベント登録
      socket.on("connect", () => {
        console.log("socket connected:", socket.id);
      });

      socket.on("categoryPresetChanged", onCategoryPresetChanged);

      socket.on("disconnect", () => {
        console.log("socket disconnected");
      });
    });

    onBeforeUnmount(() => {
      socket.off("categoryPresetChanged", onCategoryPresetChanged);
      socket.disconnect();
    });

    return { presets, newPreset, createPreset, updatePreset, deletePreset };
  },
});
</script>

<style scoped>
.preset-management {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.form input {
  display: block;
  margin: 6px 0 12px;
  padding: 6px;
  width: 100%;
  box-sizing: border-box;
}
.preset-table {
  width: 100%;
  border-collapse: collapse;
}
.preset-table th,
.preset-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
