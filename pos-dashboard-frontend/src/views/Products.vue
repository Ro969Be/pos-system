<!-- Products.vue -->

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useProductStore } from "@/stores/products";
import { useAuthStore } from "@/stores/auth";

const productStore = useProductStore();
const authStore = useAuthStore();

const newName = ref("");
const newPrice = ref<number | null>(null);
const newStock = ref<number | null>(null);
const newImageFile = ref<File | null>(null);
const editingId = ref<string | null>(null);

onMounted(() => {
  productStore.fetchProducts();
});

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null; // ✅ undefined なら null に変換
  newImageFile.value = file;
}


async function addProduct() {
  if (!newName.value || newPrice.value === null) {
    return alert("必須項目を入力してください");
  }

  const formData = new FormData();
  formData.append("name", newName.value);
  formData.append("price", String(newPrice.value));
  formData.append("stock", String(newStock.value ?? 0));
  if (newImageFile.value) {
    formData.append("image", newImageFile.value);
  }

  await productStore.addProduct(formData);
  resetForm();
}

function startEdit(product: any) {
  editingId.value = product._id;
  newName.value = product.name;
  newPrice.value = product.price;
  newStock.value = product.stock ?? 0;
  newImageFile.value = null;
}

async function saveEdit() {
  if (!editingId.value) return;

  const formData = new FormData();
  formData.append("name", newName.value);
  formData.append("price", String(newPrice.value));
  formData.append("stock", String(newStock.value ?? 0));
  if (newImageFile.value) {
    formData.append("image", newImageFile.value);
  }

  await productStore.updateProduct(editingId.value, formData);
  resetForm();
}

async function deleteProduct(id: string) {
  if (confirm("削除しますか？")) {
    await productStore.deleteProduct(id);
  }
}

function resetForm() {
  editingId.value = null;
  newName.value = "";
  newPrice.value = null;
  newStock.value = null;
  newImageFile.value = null;
}
</script>

<template>
  <div>
    <h1>商品一覧</h1>
    <ul>
      <li v-for="p in productStore.products" :key="p._id" style="margin-bottom: 20px;">
        <div>
          {{ p.name }} - {{ p.price }}円 （在庫: {{ p.stock ?? 0 }}）
        </div>
        <div v-if="p.imageUrl">
          <img :src="`http://localhost:5000${p.imageUrl}`" width="100" />
        </div>
        <div v-if="authStore.isAdmin()" style="margin-top: 5px;">
          <button @click="startEdit(p)">編集</button>
          <button @click="deleteProduct(p._id)">削除</button>
        </div>
      </li>
    </ul>

    <div v-if="authStore.isAdmin()" style="margin-top:20px;">
      <h2>{{ editingId ? "商品を編集" : "商品を追加" }}</h2>
      <input v-model="newName" placeholder="商品名" />
      <input v-model.number="newPrice" type="number" placeholder="価格" />
      <input v-model.number="newStock" type="number" placeholder="在庫数" />
      <input type="file" @change="handleFileChange" />

      <button v-if="!editingId" @click="addProduct">追加</button>
      <button v-else @click="saveEdit">保存</button>
      <button v-if="editingId" @click="resetForm">キャンセル</button>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
button {
  margin-right: 5px;
}
</style>
