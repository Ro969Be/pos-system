<template>
  <section class="page prof">
    <h2>プロフィール・権限</h2>
    <form class="panel" @submit.prevent="onSave">
      <label class="field">
        <span>表示名</span>
        <input v-model="form.userName" type="text" placeholder="山田 太郎" required />
      </label>
      <label class="field">
        <span>フリガナ（姓）</span>
        <input v-model="form.kanaSei" type="text" placeholder="ヤマダ" />
      </label>
      <label class="field">
        <span>フリガナ（名）</span>
        <input v-model="form.kanaMei" type="text" placeholder="タロウ" />
      </label>
      <div class="grid">
        <label class="field">
          <span>メール</span>
          <input :value="me.email || ''" type="email" disabled />
        </label>
        <label class="field">
          <span>電話番号</span>
          <input v-model="form.phone" type="tel" placeholder="09012345678" />
        </label>
      </div>
      <p v-if="err" class="err">{{ err }}</p>
      <div class="ops">
        <router-link class="btn ghost" to="/account/profile">戻る</router-link>
        <button class="btn" type="submit" :disabled="saving">
          {{ saving ? "保存中..." : "保存" }}
        </button>
      </div>
    </form>

    <section class="panel meta">
      <h3>現在の権限</h3>
      <div class="roles">
        <span v-for="role in me.roles" :key="role" class="pill">{{ role }}</span>
        <span v-if="!me.roles?.length">権限なし</span>
      </div>
      <h4>店舗ロール</h4>
      <ul class="bindings">
        <li v-for="binding in me.bindings" :key="binding.shopId + binding.role">
          <strong>{{ binding.role }}</strong>
          <span class="muted">ShopId: {{ binding.shopId }}</span>
        </li>
        <li v-if="!me.bindings?.length" class="muted">紐づく店舗はありません</li>
      </ul>
      <div v-if="me.shop" class="active-shop">
        <p class="muted">現在の店舗スコープ</p>
        <p>{{ me.shop.name }}（{{ me.shop.code }}）</p>
      </div>
    </section>
  </section>
</template>

<script setup>
import { reactive, ref, computed, watch } from "vue";
import api from "@/lib/api";
import { currentUser, fetchMe } from "@/lib/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const me = computed(() => currentUser.value || {});

const form = reactive({
  userName: "",
  phone: "",
  kanaSei: "",
  kanaMei: "",
});

watch(
  me,
  (val) => {
    form.userName = val?.userName || val?.name || "";
    form.phone = val?.phone || "";
    form.kanaSei = val?.kanaSei || "";
    form.kanaMei = val?.kanaMei || "";
  },
  { immediate: true }
);

const saving = ref(false);
const err = ref("");

async function onSave() {
  err.value = "";
  saving.value = true;
  try {
    await api.patch("/auth/me", {
      userName: form.userName,
      phone: form.phone,
      kanaSei: form.kanaSei,
      kanaMei: form.kanaMei,
    });
    await fetchMe();
    router.push("/account/profile");
  } catch (e) {
    err.value = e?.response?.data?.message || "保存に失敗しました";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.panel {
  background: #0f1522;
  border: 1px solid #1f2636;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.field span {
  color: #cfd6e3;
  font-size: 0.9rem;
}
input {
  background: #0b1220;
  color: #d5dbea;
  border: 1px solid #28324a;
  border-radius: 10px;
  padding: 8px 10px;
}
.ops {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.btn.ghost {
  background: #182033;
  color: #d5dbea;
  border: 1px solid #28324a;
}
.err {
  margin-top: 8px;
  color: #fca5a5;
}
.roles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.pill {
  background: #1e2640;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.85rem;
}
.bindings {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
}
.bindings li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #1c2538;
}
.muted {
  color: #7b869f;
  font-size: 0.85rem;
}
.active-shop {
  margin-top: 8px;
}
</style>
