<template>
  <section class="page">
    <h2>店舗様はこちら｜オーナー新規登録</h2>
    <p class="sub">
      店舗オーナー用のアカウントを作成します。入力後すぐにダッシュボードへ遷移します。
    </p>

    <form class="panel" @submit.prevent="onSubmit">
      <label class="field">
        <span>店舗名（必須）</span>
        <input
          v-model.trim="form.shopName"
          placeholder="例）テスト店舗A"
          autocomplete="organization"
          required
        />
      </label>

      <label class="field">
        <span>オーナー名（必須）</span>
        <input
          v-model.trim="form.name"
          placeholder="山田 太郎"
          autocomplete="name"
          required
        />
      </label>

      <label class="field">
        <span>メールアドレス（必須）</span>
        <input
          v-model.trim="form.email"
          type="email"
          placeholder="owner@example.com"
          autocomplete="email"
          required
        />
      </label>

      <label class="field">
        <span>電話番号（必須）</span>
        <input
          v-model.trim="form.phone"
          type="tel"
          placeholder="09012345678"
          autocomplete="tel"
          required
        />
      </label>

      <label class="field">
        <span>パスワード（必須）</span>
        <input
          v-model="form.password"
          type="password"
          minlength="8"
          placeholder="英数字8文字以上"
          autocomplete="new-password"
          required
        />
      </label>

      <div class="ops">
        <router-link to="/store-auth/login" class="btn ghost">ビジネスログインへ戻る</router-link>
        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? "登録中..." : "登録する" }}
        </button>
      </div>

      <p v-if="err" class="err">{{ err }}</p>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/lib/api";
import { fetchMe } from "@/lib/auth";

const router = useRouter();

const form = reactive({
  shopName: "",
  name: "",
  email: "",
  phone: "",
  password: "",
});

const loading = ref(false);
const err = ref("");

async function onSubmit() {
  err.value = "";
  loading.value = true;

  try {
    const payload = {
      shopName: form.shopName,
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    };
    const { data } = await api.post("/auth/register-owner", payload);
    if (!data?.token) throw new Error("トークンを取得できませんでした");
    localStorage.setItem("token", data.token);
    await fetchMe();
    router.push("/store/dashboard");
  } catch (e) {
    console.error("Failed to register owner", e);
    err.value =
      e?.response?.data?.message ||
      "登録に失敗しました。入力内容をご確認ください。";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page {
  padding: 16px;
  max-width: 560px;
}
.sub {
  margin: 12px 0;
  color: #9fb0c9;
}
.panel {
  background: #0f1522;
  border: 1px solid #1f2636;
  border-radius: 12px;
  padding: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
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
  margin-top: 8px;
  flex-wrap: wrap;
}
.btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn.ghost {
  background: #182033;
  color: #d5dbea;
  border: 1px solid #28324a;
}
.err {
  margin-top: 10px;
  color: #fca5a5;
}
</style>
