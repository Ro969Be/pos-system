import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import "./styles/styles.css"; // ← 全体CSS
import { initAuth } from "@/lib/auth";

initAuth();

createApp(App).use(router).mount("#app");
