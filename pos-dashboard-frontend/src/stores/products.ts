import { defineStore } from "pinia";
import api from "@/api/axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock?: number | null;
  imageUrl?: string;
}

export const useProductStore = defineStore("products", {
  state: () => ({
    products: [] as Product[],
  }),

  actions: {
    // 商品一覧を取得
    async fetchProducts() {
      const res = await api.get("/products");
      this.products = res.data;
    },

    // 商品追加
    async addProduct(formData: FormData) {
      const res = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      this.products.push(res.data);
    },

    // 商品更新
    async updateProduct(id: string, formData: FormData) {
      const res = await api.put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const index = this.products.findIndex((p) => p._id === id);
      if (index !== -1) {
        this.products[index] = res.data;
      }
    },

    // 商品削除
    async deleteProduct(id: string) {
      await api.delete(`/products/${id}`);
      this.products = this.products.filter((p) => p._id !== id);
    },
  },
});
