// pos-dashboard-frontend/src/stores/auth.ts
import { defineStore } from "pinia";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "store_admin" | "store_staff" | "user";
}

interface AuthState {
  user: User | null;
  token: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
  }),

  actions: {
    // セッション復元
    initializeAuth() {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("token");

      if (storedUser && storedToken) {
        this.user = JSON.parse(storedUser);
        this.token = storedToken;
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      }
    },

    // ログイン（既存 API を利用）
    async login(email: string, password: string) {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
        this.user = res.data.user;
        this.token = res.data.token;
        sessionStorage.setItem("user", JSON.stringify(this.user));
        sessionStorage.setItem("token", this.token ?? "");
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token ?? ""}`;
      } catch (err: any) {
        throw err;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    },

    isAdmin() {
      return this.user?.role === "admin" || this.user?.role === "store_admin";
    },

    isStoreUser() {
      return this.user?.role === "store_admin" || this.user?.role === "store_staff";
    },
  },
});
