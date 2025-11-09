// frontend/src/lib/socket.js
import { io } from "socket.io-client";

let socket = null;

export function useSocket() {
  if (!socket) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    socket = io(baseUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("❌ Socket disconnected"));
    socket.on("connect_error", (err) => console.error("⚠ Socket error:", err.message));
  }
  return socket;
}

export function joinStore(storeId) {
  const s = useSocket();
  if (storeId) s.emit("joinStore", storeId);
}
