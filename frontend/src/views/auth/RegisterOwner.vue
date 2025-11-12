<template>
  <section class="page">
    <h2>店舗様はこちら｜オーナー新規登録</h2>

    <form class="panel" @submit.prevent="onSubmit">
      <label class="field">
        <span>屋号 / 組織名（必須）</span>
        <input v-model="form.orgName" required placeholder="例）〇〇商店" />
      </label>

      <details class="hint">
        <summary>（任意）担当者・連絡先</summary>
        <div class="stack">
          <label class="field"><span>担当者名</span><input v-model="form.name" placeholder="山田 太郎" /></label>
          <label class="field"><span>メール</span><input v-model="form.email" type="email" placeholder="you@example.com" /></label>
          <label class="field"><span>電話</span><input v-model="form.phone" placeholder="090xxxxxxxx" /></label>
        </div>
      </details>

      <div class="ops">
        <router-link to="/store-auth/login" class="btn ghost">ビジネスログインへ戻る</router-link>
        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? "作成中..." : "オーナーアカウントを作成" }}
        </button>
      </div>

      <p v-if="err" class="err">{{ err }}</p>
    </form>

    <div v-if="done" class="panel ok">
      <h3>作成しました</h3>
      <p>ビジネスID（ログインID）：<code>{{ result.businessLoginId }}</code></p>
      <p>下のボタンから「ビジネス用パスワード」を設定してください（有効期限あり）。</p>
      <div class="ops">
        <a class="btn" :href="result.setPasswordUrl">パスワードを設定する</a>
        <button class="btn ghost" @click="copy(result.businessLoginId)">ビジネスIDをコピー</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { registerOwnerAny } from "@/lib/storeAuth";

const form = ref({ orgName: "", name: "", email: "", phone: "" });
const loading = ref(false);
const err = ref("");
const done = ref(false);
const result = ref({ businessLoginId: "", setPasswordUrl: "" });

async function onSubmit() {
  err.value = "";
  loading.value = true;
  try {
    const data = await registerOwnerAny(form.value);
    result.value = data;
    done.value = true;
  } catch (e) {
    err.value = e?.response?.data?.message || e?.message || "作成に失敗しました";
  } finally {
    loading.value = false;
  }
}

function copy(text) {
  navigator.clipboard.writeText(text);
  alert("コピーしました");
}
</script>

<style scoped>
.page { padding:16px; }
.panel { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:14px; max-width:720px; }
.ok { margin-top:12px; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.field span{ color:#cfd6e3; font-size:.9rem; }
input{ background:#0b1220; color:#d5dbea; border:1px solid #28324a; border-radius:10px; padding:8px 10px; }
.ops{ display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.btn{ background:#3b82f6; color:#fff; border:none; border-radius:8px; padding:8px 12px; cursor:pointer; }
.btn.ghost{ background:#182033; color:#d5dbea; border:1px solid #28324a; }
.err{ margin-top:10px; color:#fca5a5; }
.hint{ margin:10px 0; }
.stack{ margin-top:8px; display:grid; gap:8px; grid-template-columns: 1fr; }
code{ background:#0b1220; border:1px solid #28324a; padding:0 6px; border-radius:6px; }
</style>
