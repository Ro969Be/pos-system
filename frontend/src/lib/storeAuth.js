import api from "./api";
import { fetchMe, setAuthToken } from "./auth";

export async function businessLogin(loginId, password) {
  const { data } = await api.post("/business/login", { loginId, password });
  setAuthToken(data.token); // businessトークン（一時）
  return data.stores; // [{id, name, code, type}]
}

export async function selectStore(storeId) {
  const { data } = await api.post("/business/select-store", { storeId });
  setAuthToken(data.token); // 店舗スコープJWTに差し替え
  localStorage.setItem("store", JSON.stringify(data.store)); // {id,name,code,type}
  await fetchMe();
  return data.store;
}

export async function registerOwnerAny(payload) {
  // payload: { orgName, name?, email?, phone? }
  const { data } = await api.post("/business/register-owner", payload);
  return data; // { id, businessLoginId, setPasswordUrl, expiresAt }
}

export async function requestBizPasswordLink() {
  const { data } = await api.post("/business/password/request");
  return data; // { ok, url, expiresAt }
}

export async function setBusinessPassword({ token, password }) {
  const { data } = await api.post("/business/password/set", { token, password });
  return data; // { ok: true }
}
