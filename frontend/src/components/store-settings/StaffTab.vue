<template>
  <div>
    <h3 class="subt">スタッフ一覧</h3>

    <!-- 検索＋追加 -->
    <div class="panel" style="margin-bottom:10px;">
      <div class="row" style="display:flex; gap:8px; flex-wrap:wrap;">
        <input v-model="q" class="inp" placeholder="メール / TEL / ユーザーID で検索" @keyup.enter="onSearch" />
        <button class="btn" @click="onSearch">検索</button>
      </div>

      <ul v-if="candidates.length" class="list">
        <li v-for="u in candidates" :key="u.id" class="row">
          <div>
            <div class="ttl">{{ u.name || '(名称なし)' }}</div>
            <div class="sub">{{ u.email || '—' }} / {{ u.phone || '—' }}</div>
          </div>
          <div style="display:flex; gap:6px;">
            <input v-model="form.displayName" class="inp sm" placeholder="表示名" />
            <input v-model="form.accountName" class="inp sm" placeholder="アカウント名" />
            <select v-model="form.role" class="sel sm">
              <option value="staff">スタッフ</option>
              <option value="manager">店長</option>
              <option value="admin">管理者</option>
              <option value="owner">オーナー</option>
            </select>
            <button class="btn" @click="add(u.id)">追加</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- 一覧＋編集 -->
    <div class="panel">
      <table class="tbl">
        <thead>
          <tr>
            <th>表示名</th><th>アカウント名</th><th>ロール</th><th>ユーザー</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in rows" :key="s.id">
            <td><input v-model="s.displayName" class="inp sm" /></td>
            <td><input v-model="s.accountName" class="inp sm" /></td>
            <td>
              <select v-model="s.role" class="sel sm">
                <option value="staff">スタッフ</option>
                <option value="manager">店長</option>
                <option value="admin">管理者</option>
                <option value="owner">オーナー</option>
              </select>
            </td>
            <td class="sub">{{ s.userName || '—' }} / {{ s.email || '—' }} / {{ s.phone || '—' }}</td>
            <td style="text-align:right; white-space:nowrap;">
              <button class="btn" @click="save(s)">保存</button>
              <button class="btn ghost" @click="del(s)">削除</button>
            </td>
          </tr>
          <tr v-if="!rows.length"><td colspan="5" class="sub">スタッフがいません</td></tr>
        </tbody>
      </table>
    </div>

    <p v-if="err" class="err">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";

const rows = ref([]);
const q = ref("");
const candidates = ref([]);
const err = ref("");
const form = ref({ displayName:"", accountName:"", role:"staff" });

async function fetchList(){ const { data } = await api.get("/staffs"); rows.value = data; }
onMounted(fetchList);

async function onSearch(){
  candidates.value = [];
  if (!q.value) return;
  try {
    const { data } = await api.get("/staffs/search", { params: { q: q.value } });
    candidates.value = data;
  } catch { err.value = "検索に失敗しました"; }
}

async function add(userId){
  try{
    await api.post("/staffs", {
      userId,
      displayName: form.value.displayName || undefined,
      accountName: form.value.accountName || undefined,
      role: form.value.role || "staff",
    });
    q.value = ""; candidates.value = [];
    form.value = { displayName:"", accountName:"", role:"staff" };
    await fetchList();
  } catch { err.value = "追加に失敗しました"; }
}

async function save(s){
  try{
    await api.patch(`/staffs/${s.id}`, {
      displayName: s.displayName,
      accountName: s.accountName,
      role: s.role,
    });
    await fetchList();
  } catch { err.value = "更新に失敗しました"; }
}

async function del(s){
  if (!confirm("削除しますか？")) return;
  try{
    await api.delete(`/staffs/${s.id}`);
    await fetchList();
  } catch { err.value = "削除に失敗しました"; }
}
</script>

<style scoped>
.tbl{ width:100%; border-collapse:collapse; }
.tbl th,.tbl td{ border-bottom:1px solid #1f2636; padding:6px; }
.inp.sm{ width:160px; }
.sel.sm{ width:120px; }
.err{ margin-top:10px; color:#fca5a5; }
</style>
