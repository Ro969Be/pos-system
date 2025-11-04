// 権限の超シンプルな擬似ストア（後でAPI連携で差替え）
import { reactive, computed } from "vue";

export const auth = reactive({
  user: {
    id: "u-001",
    name: "Demo 店長",
    roles: ["admin"], // 一般/店舗の違いは role で切替も可
    permissions: [
      "pos.view",
      "pos.checkout",
      "kitchen.view",
      "hall.view",
      "sales.view",
    ],
  },
  // 一般/店舗のタブを分けたい場合などで利用可（今回は未使用でもOK）
  mode: "public", // "public" | "store"
});

export function can(perm) {
  return !!auth.user?.permissions?.includes(perm);
}

export function loginMock(name = "Demo 店長") {
  auth.user = {
    id: "u-001",
    name,
    roles: ["admin"],
    permissions: [
      "pos.view",
      "pos.checkout",
      "kitchen.view",
      "hall.view",
      "sales.view",
    ],
  };
}

export function logoutMock() {
  auth.user = null;
}

export const currentUser = computed(() => auth.user);
export const isLoggedIn = computed(() => !!auth.user);
