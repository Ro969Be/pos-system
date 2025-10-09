<template>
    <div class="p-6">
        <h2 class="text-xl font-bold mb-4">支払い方法を選択</h2>

        <div class="space-y-4">
            <div
                v-for="method in paymentMethods"
                :key="method._id"
                class="flex items-center justify-between border rounded-lg p-4 shadow"
            >
                <label class="flex items-center gap-3">
                <input
                    type="checkbox"
                    v-model="selected[method._id].checked"
                />
                <span class="text-lg font-semibold">{{ method.displayName }}</span>
                </label>

                <input
                type="number"
                v-model.number="selected[method._id].amount"
                :disabled="!selected[method._id].checked"
                class="border p-2 w-28 text-right rounded"
                placeholder="金額"
                />
            </div>
        </div>

        <div class="mt-6">
            <button
                @click="confirmPayment"
                class="px-6 py-3 bg-green-600 text-white rounded"
            >
                決定
            </button>
        </div>
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

    const paymentMethods = ref<PaymentMethod[]>([]);
    const selected = ref<Record<string, { checked: boolean; amount: number }>>({});

    const fetchPaymentMethods = async () => {
    const res = await api.get("/payment-methods?activeOnly=true");
    paymentMethods.value = res.data;

    // 初期化
    res.data.forEach((m: PaymentMethod) => {
        selected.value[m._id] = { checked: false, amount: 0 };
    });
    };

    const confirmPayment = () => {
    const payments = Object.entries(selected.value)
        .filter(([_, val]) => val.checked && val.amount > 0)
        .map(([id, val]) => ({
        method: id,
        amount: val.amount,
        }));

    console.log("送信データ", payments);

    // API送信例
    /*
    await api.post("/orders", {
        items: [...],
        payments,
        reservationDate: new Date(),
    });
    */
    };

    onMounted(fetchPaymentMethods);
</script>


<style scoped>
    /* スマホ操作向けにカードを少し大きめに */
    div[role="button"] {
        min-height: 100px;
    }
</style>
