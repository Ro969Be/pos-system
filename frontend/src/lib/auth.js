// frontend/src/lib/auth.js
import { reactive, computed } from "vue";
import api from "@/lib/api";

const state = reactive({
  user: null, // { id, name, role, storeId, permissions? }
  loading: false,
});

export const currentUser = computed(() => state.user);
export const isLoggedIn = computed(() => !!state.user);

export function can(perm) {
  if (!state.user?.permissions) return false;
  return state.user.permissions.includes(perm);
}

export async function fetchMe() {
  try {
    state.loading = true;
    const { data } = await api.get("/auth/me");
    state.user = data || null;
  } catch {
    state.user = null;
  } finally {
    state.loading = false;
  }
}

export async function login(email, password) {
  const { data } = await api.post("auth/login", { email, password });
  if (data?.token) localStorage.setItem("token", data.token);
  await fetchMe(); // user セット
  return state.user;
}

export function logout() {
  localStorage.removeItem("token");
  state.user = null;
}

export default {
  state,
  currentUser,
  isLoggedIn,
  can,
  fetchMe,
  login,
  logout,
};
