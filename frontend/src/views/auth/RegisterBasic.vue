<template>
  <section class="page auth">
    <h2>新規登録</h2>
    <p class="sub">基本情報を入力してください（※ダミー）</p>

    <form class="panel" @submit.prevent="submit">
      <label class="field">
        <span>UserId（自動生成）</span>
        <input :value="userId" type="text" readonly />
      </label>

      <label class="field">
        <span>名前</span>
        <input v-model="name" type="text" placeholder="山田 太郎" required />
      </label>

      <label class="field">
        <span>名前（カナ）</span>
        <input v-model="nameKana" type="text" placeholder="ヤマダ タロウ" required />
      </label>

      <label class="field">
        <span>電話番号</span>
        <input v-model="tel" type="tel" placeholder="09012345678" required />
      </label>

      <label class="field">
        <span>メールアドレス</span>
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </label>

      <div class="ops">
        <router-link class="btn ghost" to="/login">戻る</router-link>
        <button class="btn" type="submit">登録する</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { genUserId } from "@/lib/id";

const router = useRouter();
const userId = genUserId();

const name = ref("");
const nameKana = ref("");
const tel = ref("");
const email = ref("");

function submit() {
  // TODO: バックエンドにPOST。今はクエリで完了画面へ
  const params = new URLSearchParams({
    userId, name: name.value, nameKana: nameKana.value, tel: tel.value, email: email.value
  }).toString();
  router.push(`/register/done?${params}`);
}
</script>

<style src="../../styles/pages/Auth.css"></style>
