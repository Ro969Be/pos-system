<template>
  <section class="page prof">
    <h2>プロフィール変更</h2>
    <form class="panel" @submit.prevent="save">
      <label class="field">
        <span>名前（表示）</span>
        <input v-model="form.name" type="text" placeholder="山田 太郎" required />
      </label>

      <h3 class="subt">連絡先一覧</h3>
      <div class="list">
        <label class="field"><span>メール</span><input v-model="form.email" type="email" placeholder="you@example.com" /></label>
        <label class="field"><span>TEL</span><input v-model="form.tel" type="tel" placeholder="09012345678" /></label>
        <label class="field"><span>住所</span><input v-model="form.address" type="text" placeholder="東京都千代田区..." /></label>
      </div>

      <div class="ops">
        <router-link class="btn ghost" to="/account/profile">戻る</router-link>
        <button class="btn" type="submit">保存</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { currentUser } from "@/lib/auth";

const router = useRouter();
const user = currentUser.value || { name:"", email:"", tel:"", address:"" };

const form = reactive({
  name: user.name || "",
  email: user.email || "",
  tel: user.tel || "",
  address: user.address || "",
});

function save(){
  alert("ダミー保存：後でAPI連携");
  router.push("/account/profile");
}
</script>

<style src="@/styles/pages/Profile.css"></style>
