<template>
  <section class="page prof">
    <h2>プロフィール変更</h2>
    <form class="panel" @submit.prevent="onSave">
      <label class="field">
        <span>名前（表示）</span>
        <input v-model="form.name" type="text" placeholder="山田 太郎" required />
      </label>

      <h3 class="subt">連絡先一覧</h3>
      <div class="list">
        <label class="field"><span>メール</span><input v-model="form.email" type="email" placeholder="you@example.com" disabled /></label>
        <label class="field"><span>TEL</span><input v-model="form.phone" type="tel" placeholder="09012345678" /></label>
        <label class="field"><span>住所</span><input v-model="form.address" type="text" placeholder="（将来実装）" disabled /></label>
      </div>

      <p v-if="err" class="err">{{ err }}</p>

      <div class="ops">
        <router-link class="btn ghost" to="/account/profile">戻る</router-link>
        <button class="btn" type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import api from "@/lib/api";
import { currentUser, fetchMe } from "@/lib/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const me = currentUser.value || { name:"", email:"", phone:"" };

const form = reactive({
  name: me.name || "",
  email: me.email || "",
  phone: me.phone || "",
  address: "",
});

const saving = ref(false);
const err = ref("");

async function onSave(){
  err.value = ""; saving.value = true;
  try{
    await api.patch("/api/auth/me", { name: form.name, phone: form.phone });
    await fetchMe(); // ヘッダーの表示名も更新
    alert("プロフィールを保存しました。");
    router.push("/account/profile");
  }catch(e){
    err.value = e?.response?.data?.message || "保存に失敗しました";
  }finally{
    saving.value = false;
  }
}
</script>

<style src="@/styles/pages/Profile.css"></style>
