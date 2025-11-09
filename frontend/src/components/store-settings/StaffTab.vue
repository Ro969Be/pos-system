<template>
  <div>
    <h3>スタッフ一覧</h3>
    <div class="ops">
      <input v-model="form.name" placeholder="名前" />
      <input v-model="form.email" placeholder="メール" />
      <input v-model="form.phone" placeholder="TEL" />
      <select v-model="form.role">
        <option value="staff">スタッフ</option>
        <option value="manager">店長</option>
      </select>
      <input v-model="form.password" type="password" placeholder="パスワード" />
      <button class="btn" @click="create">追加</button>
    </div>
    <ul class="list">
      <li v-for="s in rows" :key="s.id" class="row">
        <div>
          <div class="ttl">{{ s.name }} <small>({{ s.role }})</small></div>
          <div class="sub">{{ s.email }} / {{ s.phone }}</div>
        </div>
        <div class="ops">
          <button class="btn ghost" @click="edit(s)">編集</button>
          <button class="btn danger" @click="del(s.id)">削除</button>
        </div>
      </li>
    </ul>
    <p v-if="err" class="err">{{ err }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/lib/api";
const rows = ref([]); const err = ref("");
const form = ref({ name:"", email:"", phone:"", role:"staff", password:"" });

async function load(){ const {data}=await api.get("/staffs"); rows.value=data; }
async function create(){
  try{ await api.post("/staffs", form.value); form.value={name:"",email:"",phone:"",role:"staff",password:""}; await load(); }
  catch(e){ err.value="作成に失敗しました"; }
}
async function edit(s){
  const name=prompt("名前", s.name); if(name===null)return;
  await api.patch(`/staffs/${s.id}`, { name }); await load();
}
async function del(id){ if(!confirm("削除しますか？"))return; await api.delete(`/staffs/${id}`); await load(); }
onMounted(load);
</script>
