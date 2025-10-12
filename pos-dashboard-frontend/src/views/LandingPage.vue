<!-- LandingPage.vue -->
<template>
  <div class="landing">
    <h1>ようこそ</h1>
    <p>ご利用形態を選択してください</p>

    <div class="choices">
      <button @click="goStore">店舗様（管理）</button>
      <button @click="goUser">一般ユーザー</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "LandingPage",
  setup() {
    const router = useRouter();

    const goStore = () => {
      router.push("/store-login");
    };

    const goUser = () => {
      router.push("/user-login");
    };

    return { goStore, goUser };
  },
});
</script>

<style scoped>
.landing {
  padding: 40px;
  text-align: center;
}
.choices button {
  margin: 8px;
  padding: 12px 20px;
}
</style>
