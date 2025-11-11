<template>
  <section class="page">
    <header class="head">
      <h2>クーポン管理</h2>
      <button class="btn" @click="startCreate">追加</button>
    </header>
    <div v-if="error" class="err">{{ error }}</div>
    <table class="list">
      <thead>
        <tr>
          <th>名称</th>
          <th>コード</th>
          <th>割引</th>
          <th>有効期限</th>
          <th>発行数</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="coupon in coupons" :key="coupon._id">
          <td>{{ coupon.name }}</td>
          <td>{{ coupon.code }}</td>
          <td>
            {{ coupon.discountType === "amount" ? "¥" + coupon.discountValue : coupon.discountValue + "%" }}
          </td>
          <td>
            <span v-if="coupon.validDaysAfterAcquire">
              取得後 {{ coupon.validDaysAfterAcquire }} 日
            </span>
            <span v-else>
              {{ formatDate(coupon.validFrom) }} - {{ formatDate(coupon.validUntil) }}
            </span>
          </td>
          <td>{{ coupon.redeemedCount }} / {{ coupon.maxRedemptions || "∞" }}</td>
          <td>
            <button class="btn ghost" @click="issue(coupon)">発行</button>
            <button class="btn danger ghost" @click="remove(coupon)">削除</button>
          </td>
        </tr>
        <tr v-if="!coupons.length">
          <td colspan="6" class="muted">クーポンがありません</td>
        </tr>
      </tbody>
    </table>

    <form v-if="showForm" class="panel" @submit.prevent="save">
      <h3>クーポン追加</h3>
      <label class="field">
        <span>名称</span>
        <input v-model="form.name" required />
      </label>
      <label class="field">
        <span>コード</span>
        <input v-model="form.code" required />
      </label>
      <label class="field">
        <span>割引タイプ</span>
        <select v-model="form.discountType">
          <option value="amount">金額</option>
          <option value="percent">割合</option>
        </select>
      </label>
      <label class="field">
        <span>割引値</span>
        <input type="number" min="1" v-model.number="form.discountValue" required />
      </label>
      <label class="field">
        <span>取得後有効日数</span>
        <input type="number" min="0" v-model.number="form.validDaysAfterAcquire" />
      </label>
      <label class="field">
        <span>固定期間 (終了日)</span>
        <input type="date" v-model="form.validUntil" />
      </label>
      <label class="field">
        <span>上限</span>
        <input type="number" min="0" v-model.number="form.maxRedemptions" />
      </label>
      <div class="ops">
        <button class="btn ghost" type="button" @click="cancel">キャンセル</button>
        <button class="btn" type="submit" :disabled="saving">
          {{ saving ? "保存中..." : "保存" }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/lib/api";

const route = useRoute();
const shopId = route.params.shopId;
const coupons = ref([]);
const error = ref("");
const showForm = ref(false);
const saving = ref(false);
const form = reactive({
  name: "",
  code: "",
  discountType: "amount",
  discountValue: 100,
  validDaysAfterAcquire: 0,
  validUntil: "",
  maxRedemptions: 0,
});

async function load() {
  const { data } = await api.get(`/shops/${shopId}/coupons`);
  coupons.value = data || [];
}

function startCreate() {
  Object.assign(form, {
    name: "",
    code: "",
    discountType: "amount",
    discountValue: 100,
    validDaysAfterAcquire: 0,
    validUntil: "",
    maxRedemptions: 0,
  });
  showForm.value = true;
}

function cancel() {
  showForm.value = false;
}

async function save() {
  saving.value = true;
  try {
    await api.post(`/shops/${shopId}/coupons`, form);
    showForm.value = false;
    await load();
  } catch (e) {
    error.value = e?.response?.data?.message || "保存に失敗しました";
  } finally {
    saving.value = false;
  }
}

async function issue(coupon) {
  try {
    const { data } = await api.post(
      `/shops/${shopId}/coupons/${coupon._id}/redemptions`,
      {}
    );
    alert(`発行しました。期限: ${data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "未設定"}`);
  } catch (e) {
    error.value = e?.response?.data?.message || "発行に失敗しました";
  }
}

async function remove(coupon) {
  if (!confirm(`「${coupon.name}」を削除しますか？`)) return;
  await api.delete(`/shops/${shopId}/coupons/${coupon._id}`);
  await load();
}

function formatDate(val) {
  return val ? new Date(val).toLocaleDateString() : "-";
}

onMounted(load);
</script>

<style scoped>
.page { padding:16px; }
.head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.list { width:100%; border-collapse:collapse; background:#0f1522; border:1px solid #1f2636; margin-bottom:16px; }
.list th,.list td{ padding:8px; border-bottom:1px solid #1f2636; }
.muted{ text-align:center; color:#7b869f; padding:10px 0; }
.panel{ background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:16px; max-width:420px; }
.field{ display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.ops{ display:flex; justify-content:flex-end; gap:8px; }
.btn{ background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; }
.btn.ghost{ background:transparent; border:1px solid #3b82f6; color:#3b82f6; }
.btn.danger{ border-color:#ef4444; color:#ef4444; }
.err{ color:#f87171; margin-bottom:8px; }
input, select{ background:#0b1220; border:1px solid #28324a; border-radius:8px; color:#d5dbea; padding:8px; }
</style>
