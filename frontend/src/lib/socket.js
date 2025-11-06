// ✅ frontend/src/lib/socket.js
import { io } from "socket.io-client";

let socket = null;

export function useSocket() {
  if (!socket) {
    // APIのURL（Viteの環境変数）を優先的に使用
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    socket = io(baseUrl, {
      transports: ["websocket"], // 安定してリアルタイム稼働させる
      withCredentials: true, // CORSでCookie/JWTを扱うときに必要
    });

    // ✅ デバッグログ（必要なければ削除OK）
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
    socket.on("connect_error", (err) => {
      console.error("⚠ Socket connection error:", err.message);
    });
  }
  return socket;
}
