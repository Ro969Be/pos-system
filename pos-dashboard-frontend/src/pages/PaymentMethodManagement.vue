<template>
    <div class="p-6">
        <h2 class="text-xl font-bold mb-4">支払い方法管理</h2>

        <!-- 新規追加フォーム -->
        <form @submit.prevent="addMethod" class="mb-6 flex gap-2">
            <input
                v-model="newMethod.name"
                type="text"
                placeholder="name (例: paypay)"
                class="border p-2 rounded"
            />
            <input
                v-model="newMethod.displayName"
                type="text"
                placeholder="表示名 (例: PayPay)"
                class="border p-2 rounded"
            />
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
                追加
            </button>
        </form>

        <!-- 一覧 -->
        <table class="w-full border-collapse border">
            <thead>
                <tr class="bg-gray-200">
                <th class="border p-2">name</th>
                <th class="border p-2">表示名</th>
                <th class="border p-2">有効</th>
                <th class="border p-2">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="method in methods"
                    :key="method._id"
                    :class="{ 'opacity-50': !method.isActive }"
                >
                    <td class="border p-2">{{ method.name }}</td>
                    <td class="border p-2">
                    <input
                        v-model="method.displayName"
                        @blur="updateMethod(method)"
                        class="border p-1 rounded"
                    />
                    </td>
                    <td class="border p-2 text-center">
                    <input
                        type="checkbox"
                        v-model="method.isActive"
                        @change="updateMethod(method)"
                    />
                    </td>
                    <td class="border p-2 text-center">
                    <button
                        v-if="method.isActive"
                        @click="deleteMethod(method._id)"
                        class="bg-red-500 text-white px-2 py-1 rounded"
                    >
                        非表示
                    </button>
                    <span v-else class="text-gray-500">非表示中</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import api from "../api/axios";

interface PaymentMethod {
    _id: string;
    name: string;
    displayName: string;
    isActive: boolean;
}

const methods = ref<PaymentMethod[]>([]);
const newMethod = ref({ name: "", displayName: "" });

// 一覧取得
const fetchMethods = async () => {
    const res = await api.get("/payment-methods");
    methods.value = res.data;
};

// 新規追加
const addMethod = async () => {
    await api.post("/payment-methods", newMethod.value);
    newMethod.value = { name: "", displayName: "" };
    fetchMethods();
};

// 更新
const updateMethod = async (method: PaymentMethod) => {
    await api.put(`/payment-methods/${method._id}`, {
        displayName: method.displayName,
        isActive: method.isActive,
    });
};

// 削除
const deleteMethod = async (id: string) => {
    if (confirm("削除しますか？")) {
        await api.delete(`/payment-methods/${id}`);
        fetchMethods();
    }
};

onMounted(fetchMethods);
</script>
