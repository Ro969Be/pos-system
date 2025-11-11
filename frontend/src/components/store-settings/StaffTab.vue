<template>
  <div>
    <h3 class="subt">スタッフ一覧</h3>

    <!-- 検索＋追加（自分未満のロールのみ付与可能） -->
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
          <div style="display:flex; gap:6px; align-items:center;">
            <input v-model="form.displayName" class="inp sm" placeholder="表示名" />
            <input v-model="form.accountName" class="inp sm" placeholder="アカウント名" />

            <!-- 自分の権限より下だけを選択肢に出す（adminはそもそも出さない） -->
            <select v-model="form.role" class="sel sm">
              <option
                v-for="(label, key) in roleLabel"
                :key="key"
                :value="key"
                v-if="ROLE_RANK[key] < ROLE_RANK[me.role]"
              >
                {{ label }}
              </option>
            </select>

            <button class="btn" @click="add(u.id)" :disabled="!canAssign(form.role)">追加</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- 一覧＋編集（自分と同等以上は編集不可） -->
    <div class="panel">
      <table class="tbl">
        <thead>
          <tr>
            <th>表示名</th><th>アカウント名</th><th>ロール</th><th>ユーザー</th><th></th>
          </tr>
        </thead>
        <tbody>
          <!-- 念のためクライアント側でも admin を非表示（API側でも除外していて二重安全） -->
          <tr v-for="s in filteredRows" :key="s.id">
            <td><input v-model="s.displayName" class="inp sm" :disabled="!canManage(s)" /></td>
            <td><input v-model="s.accountName" class="inp sm" :disabled="!canManage(s)" /></td>
            <td>
              <select v-model="s.role" class="sel sm" :disabled="!canManage(s)">
                <option
                  v-for="(label, key) in roleLabel"
                  :key="key"
                  :value="key"
                  v-if="ROLE_RANK[key] < ROLE_RANK[me.role]"
                >
                  {{ label }}
                </option>
              </select>
            </td>
            <td class="sub">{{ s.userName || '—' }} / {{ s.email || '—' }} / {{ s.phone || '—' }}</td>
            <td style="text-align:right; white-space:nowrap;">
              <button class="btn" :disabled="!s.canEdit" @click="save(s)">保存</button>
              <button class="btn ghost" :disabled="!s.canDelete" @click="del(s)">削除</button>
            </td>
          </tr>
          <tr v-if="!filteredRows.length"><td colspan="5" class="sub">スタッフがいません</td></tr>
        </tbody>
      </table>
    </div>

    <p v-if="err" class="err">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/lib/api";

const rows = ref([]);
const q = ref("");
const candidates = ref([]);
const err = ref("");
const me = ref({ role: "staff" }); // /auth/me の結果を格納

// ロール定義（バックエンドと一致させる）
const ROLE_RANK = {
  part_time: 0,
  employee: 1,
  assistant_manager: 2,
  store_manager: 3,
  area_manager: 4,
  owner: 5,
  admin: 6,
};
const roleLabel = {
  part_time: "アルバイト",
  employee: "一般社員",
  assistant_manager: "副店長",
  store_manager: "店長",
  area_manager: "エリアマネージャー",
  owner: "オーナー",
};
const rankOf = (r) => ROLE_RANK[r] ?? -1;

// 自分より「下」だけを編集/付与可
function canManage(s) {
  return rankOf(me.value.role) > rankOf(s.role) && s.role !== "admin";
}
function canAssign(role) {
  return ROLE_RANK[role] < ROLE_RANK[me.value.role];
}

// admin をクライアントでも除外表示
const filteredRows = computed(() => rows.value.filter((x) => x.role !== "admin"));

const form = ref({ displayName: "", accountName: "", role: "employee" });

async function fetchMe() {
  try {
    const { data } = await api.get("/auth/me");
    me.value = data || { role: "staff" };
  } catch {
    me.value = { role: "staff" };
  }
}

async function fetchList() {
  const { data } = await api.get("/staffs");
  rows.value = data;
}

onMounted(async () => {
  await fetchMe();
  await fetchList();
});

async function onSearch() {
  candidates.value = [];
  if (!q.value) return;
  try {
    const { data } = await api.get("/staffs/search", { params: { q: q.value } });
    candidates.value = data;
  } catch {
    err.value = "検索に失敗しました";
  }
}

async function add(userId) {
  try {
    if (!canAssign(form.value.role)) {
      err.value = "自分と同等以上の権限は付与できません";
      return;
    }
    await api.post("/staffs", {
      userId,
      displayName: form.value.displayName || undefined,
      accountName: form.value.accountName || undefined,
      role: form.value.role || "employee",
    });
    q.value = ""; candidates.value = [];
    form.value = { displayName: "", accountName: "", role: "employee" };
    await fetchList();
  } catch (e) {
    err.value = e?.response?.data?.message || "追加に失敗しました";
  }
}

async function save(s) {
  try {
    if (!canManage(s)) {
      err.value = "自分と同等以上の権限は編集できません";
      return;
    }
    await api.patch(`/staffs/${s.id}`, {
      displayName: s.displayName,
      accountName: s.accountName,
      role: s.role,
    });
    await fetchList();
  } catch (e) {
    err.value = e?.response?.data?.message || "更新に失敗しました";
  }
}

async function del(s) {
  if (!confirm("削除しますか？")) return;
  try {
    if (!canManage(s)) {
      err.value = "自分と同等以上の権限は削除できません";
      return;
    }
    await api.delete(`/staffs/${s.id}`);
    await fetchList();
  } catch (e) {
    err.value = e?.response?.data?.message || "削除に失敗しました";
  }
}
</script>

<style scoped>
.tbl{ width:100%; border-collapse:collapse; }
.tbl th,.tbl td{ border-bottom:1px solid #1f2636; padding:6px; }
.inp.sm{ width:160px; }
.sel.sm{ width:160px; }
.err{ margin-top:10px; color:#fca5a5; }
</style>
