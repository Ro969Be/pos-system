<template>
  <section class="page">
    <h2>お客様用新規登録</h2>
    <p class="sub">
      必要事項を入力してアカウントを作成してください。登録後すぐにご利用いただけます。
    </p>

    <form class="panel" @submit.prevent="onSubmit">
      <label class="field">
        <span>お名前</span>
        <input
          v-model.trim="form.name"
          type="text"
          required
          placeholder="山田 太郎"
          autocomplete="name"
        />
      </label>

      <label class="field">
        <span>メールアドレス</span>
        <input
          v-model.trim="form.email"
          type="email"
          required
          placeholder="user@example.com"
          autocomplete="email"
        />
      </label>

      <label class="field">
        <span>電話番号（任意）</span>
        <input
          v-model.trim="form.phone"
          type="tel"
          placeholder="09012345678"
          autocomplete="tel"
        />
      </label>

      <label class="field">
        <span>パスワード</span>
        <input
          v-model="form.password"
          type="password"
          required
          minlength="8"
          placeholder="英数字8文字以上"
          autocomplete="new-password"
        />
      </label>

      <div class="ops">
        <router-link class="btn ghost" to="/login">すでにアカウントをお持ちの方</router-link>
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
import { registerUser } from "@/lib/auth";

const router = useRouter();
const form = reactive({
  name: "",
  email: "",
  password: "",
  phone: "",
});
const loading = ref(false);
const err = ref("");

async function onSubmit() {
  err.value = "";
  loading.value = true;
  try {
    await registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
    });
    router.push("/public/shops");
  } catch (e) {
    console.error("Failed to register user", e);
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
  max-width: 520px;
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
