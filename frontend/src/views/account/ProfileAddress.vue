<template>
  <section class="page prof">
    <h2>住所</h2>
    <form class="panel" @submit.prevent="save">
      <div class="grid2">
        <label class="field"><span>国</span><input v-model="form.country" placeholder="日本" /></label>
        <label class="field"><span>郵便番号</span><input v-model="form.zip" placeholder="1000001" /></label>
      </div>

      <div class="grid3">
        <label class="field"><span>都道府県</span><input v-model="form.pref" /></label>
        <label class="field"><span>市区町村</span><input v-model="form.city" /></label>
        <label class="field"><span>地名</span><input v-model="form.town" /></label>
      </div>

      <div class="grid2">
        <label class="field"><span>番地</span><input v-model="form.block" /></label>
        <label class="field"><span>建物名・部屋番号</span><input v-model="form.building" /></label>
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
const form = reactive({
  country:"", zip:"", pref:"", city:"", town:"", block:"", building:""
});
function save(){ alert("ダミー保存：後でAPI連携"); }
</script>

<style src="@/styles/pages/Profile.css"></style>
