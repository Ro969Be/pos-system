// main.ts

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";

const app = createApp(App);
app.use(createPinia());
app.use(router);

// アプリ起動時にセッション情報を復元
const auth = useAuthStore();
auth.initializeAuth();

app.mount("#app");