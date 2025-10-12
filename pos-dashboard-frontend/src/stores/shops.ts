// src/stores/storeStore.ts
// 店舗データ管理ストア（Pinia）
// - 店舗登録API呼び出し
// - 店舗一覧取得API呼び出し

import { defineStore } from "pinia";
import axios from "axios";

export const useShopStore = defineStore("storeStore", {
  state: () => ({
    stores: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // 店舗新規登録
    async registerStore(storeData: {
      storeCode: string;
      storeName: string;
      address?: string;
      phone?: string;
    }) {
      try {
        this.loading = true;
        this.error = null;

        const token = sessionStorage.getItem("token");
        const res = await axios.post("http://localhost:5000/api/stores/register", storeData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 登録した店舗を追加
        this.stores.push(res.data.store);
        return res.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || "店舗登録に失敗しました";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 店舗一覧取得
    async fetchStores() {
      try {
        this.loading = true;
        this.error = null;

        const token = sessionStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/stores/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.stores = res.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || "店舗一覧の取得に失敗しました";
      } finally {
        this.loading = false;
      }
    },
  },
});
