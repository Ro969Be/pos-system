// frontend/src/lib/auth.js
import { reactive, computed } from "vue";
import api, {
  registerUser as registerUserRequest,
  loginUser as loginUserRequest,
} from "@/lib/api";

const TOKEN_KEY = "authToken";
const LEGACY_TOKEN_KEY = "token";
const savedToken =
  localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);

const state = reactive({
  token: savedToken,
  user: null, // { id, name, role, storeId, permissions? }
  loading: false,
  initialized: false,
});

if (state.token) {
  api.defaults.headers.common.Authorization = `Bearer ${state.token}`;
}

export const currentUser = computed(() => state.user);
export const isAuthenticated = computed(() => !!state.token);
export const isLoggedIn = computed(() => !!state.user);

export function can(perm) {
  if (!state.user?.permissions) return false;
  return state.user.permissions.includes(perm);
}

function persistToken(token) {
  state.token = token || null;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

export async function fetchMe() {
  try {
    state.loading = true;
    const { data } = await api.get("/auth/me");
    state.user = data || null;
  } catch (err) {
    state.user = null;
    if (err?.response?.status === 401) {
      persistToken(null);
    }
  } finally {
    state.loading = false;
    state.initialized = true;
  }
}

async function handleAuthResponse(res) {
  if (!res?.token) throw new Error("トークンを取得できませんでした");
  persistToken(res.token);
  if (res.user) {
    state.user = res.user;
    state.initialized = true;
  } else {
    await fetchMe();
  }
}

export async function registerUser(payload) {
  const res = await registerUserRequest(payload);
  await handleAuthResponse(res);
  return state.user;
}

export async function loginUser(payload) {
  const res = await loginUserRequest(payload);
  await handleAuthResponse(res);
  return state.user;
}

export function setAuthToken(token) {
  persistToken(token);
}

export function logout() {
  persistToken(null);
  state.user = null;
  state.initialized = true;
}

let initPromise = null;
export function initAuth() {
  if (initPromise) return initPromise;
  if (!state.token) {
    state.initialized = true;
    initPromise = Promise.resolve();
  } else {
    initPromise = fetchMe();
  }
  return initPromise;
}

export function ensureAuthReady() {
  if (state.initialized) return Promise.resolve();
  return initAuth();
}

export default {
  state,
  currentUser,
  isAuthenticated,
  isLoggedIn,
  can,
  fetchMe,
  registerUser,
  loginUser,
  setAuthToken,
  logout,
  initAuth,
  ensureAuthReady,
};
