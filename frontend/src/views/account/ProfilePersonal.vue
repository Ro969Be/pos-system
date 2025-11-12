<template>
  <section class="page prof">
    <h2>個人情報</h2>
    <form class="panel" @submit.prevent="save">
      <div class="grid2">
        <label class="field"><span>姓</span><input v-model="form.lastName" /></label>
        <label class="field"><span>セイ</span><input v-model="form.lastKana" /></label>
        <label class="field"><span>名</span><input v-model="form.firstName" /></label>
        <label class="field"><span>メイ</span><input v-model="form.firstKana" /></label>
      </div>

      <div class="grid3">
        <label class="field"><span>性別</span>
          <select v-model="form.gender">
            <option value="">未選択</option>
            <option>男性</option><option>女性</option><option>その他</option>
          </select>
        </label>
        <label class="field"><span>生年月日</span><input v-model="form.birthday" type="date" /></label>
        <label class="field"><span>Phone</span><input v-model="form.phone" type="tel" /></label>
      </div>

      <label class="switch">
        <input type="checkbox" v-model="form.phonePublic" />
        <span>番号を公開する</span>
      </label>

      <div class="ops">
        <router-link class="btn ghost" to="/account/profile">戻る</router-link>
        <button class="btn" type="submit">保存</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive } from "vue";
const form = reactive({
  lastName:"", lastKana:"", firstName:"", firstKana:"",
  gender:"", birthday:"", phone:"", phonePublic:false
});
function save(){ alert("ダミー保存：後でAPI連携"); }
</script>

<style src="@/styles/pages/Profile.css"></style>
