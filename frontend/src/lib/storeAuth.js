import api from "./api";
import { fetchMe } from "./auth";

export async function businessLogin(loginId, password) {
  const { data } = await api.post("/business/login", { loginId, password });
  localStorage.setItem("token", data.token); // businessトークン（一時）
  return data.stores; // [{id, name, code, type}]
}

export async function selectStore(storeId) {
  const { data } = await api.post("/business/select-store", { storeId });
  localStorage.setItem("token", data.token); // 店舗スコープJWTに差し替え
  localStorage.setItem("store", JSON.stringify(data.store)); // {id,name,code,type}
  await fetchMe();
  return data.store;
}
