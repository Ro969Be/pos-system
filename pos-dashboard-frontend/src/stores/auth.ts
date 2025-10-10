// auth.ts

import { defineStore } from "pinia";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
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
    // ✅ 初期化時に sessionStorage から自動復元
    initializeAuth() {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("token");

      if (storedUser && storedToken) {
        this.user = JSON.parse(storedUser);
        this.token = storedToken;
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      }
    },

    async login(email: string, password: string) {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });

        this.user = res.data.user;
        this.token = res.data.token;

        // ✅ sessionStorage に保存
        sessionStorage.setItem("user", JSON.stringify(this.user));

        // ✅ token が存在する場合のみ保存 & axios に適用
        if (this.token) {
          sessionStorage.setItem("token", this.token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
        }

      } catch (err: any) {
        alert(err.response?.data?.message || "ログインに失敗しました");
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
      return this.user?.role === "admin";
    },
  },
});
