<template>
  <section class="page">
    <h2>ビジネス用パスワードの設定</h2>

    <div class="panel" v-if="!done">
      <p class="sub">受け取ったリンクから遷移しています。パスワードを設定してください。</p>

      <form @submit.prevent="onSubmit">
        <label class="field">
          <span>新しいパスワード</span>
          <input v-model="pw" type="password" required minlength="6" placeholder="6文字以上" />
        </label>
        <label class="field">
          <span>確認のため再入力</span>
          <input v-model="pw2" type="password" required minlength="6" placeholder="もう一度入力" />
        </label>

        <div class="ops">
          <router-link to="/store-auth/login" class="btn ghost">ログインへ戻る</router-link>
          <button class="btn" type="submit" :disabled="loading">{{ loading ? "送信中..." : "設定する" }}</button>
        </div>

        <p v-if="err" class="err">{{ err }}</p>
      </form>
    </div>

    <div v-else class="panel ok">
      <h3>設定が完了しました</h3>
      <p>ログイン画面へ移動し、<b>ビジネスID</b> と今設定したパスワードでログインしてください。</p>
      <div class="ops">
        <router-link to="/store-auth/login" class="btn">ビジネスログインへ</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { setBusinessPassword } from "@/lib/storeAuth";

const route = useRoute();
const token = ref("");
const pw = ref("");
const pw2 = ref("");
const loading = ref(false);
const err = ref("");
const done = ref(false);

onMounted(() => {
  token.value = String(route.query.token || "");
});

async function onSubmit() {
  err.value = "";
  if (!token.value) { err.value = "リンクが不正または期限切れです"; return; }
  if (pw.value.length < 6) { err.value = "パスワードは6文字以上にしてください"; return; }
  if (pw.value !== pw2.value) { err.value = "確認用パスワードが一致しません"; return; }
  loading.value = true;
  try {
    await setBusinessPassword({ token: token.value, password: pw.value });
    done.value = true;
  } catch (e) {
    err.value = e?.response?.data?.message || e?.message || "設定に失敗しました";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page { padding:16px; }
.panel { background:#0f1522; border:1px solid #1f2636; border-radius:12px; padding:14px; max-width:520px; }
.ok { margin-top:12px; }
.field { display:flex; flex-direction:column; gap:6px; margin-bottom:10px; }
.field span{ color:#cfd6e3; font-size:.9rem; }
input{ background:#0b1220; color:#d5dbea; border:1px solid #28324a; border-radius:10px; padding:8px 10px; }
.ops{ display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
.btn{ background:#3b82f6; color:#fff; border:none; border-radius:8px; padding:8px 12px; cursor:pointer; }
.btn.ghost{ background:#182033; color:#d5dbea; border:1px solid #28324a; }
.err{ margin-top:10px; color:#fca5a5; }
.sub{ color:#9fb0c9; margin: 6px 0 10px; }
</style>
