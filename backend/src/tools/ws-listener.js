// backend/src/tools/ws-listener.js
import { io } from "socket.io-client";
const socket = io("http://localhost:5000", { transports: ["websocket"] });

socket.on("connect", () => console.log("connected", socket.id));
socket.on("ticket:updated", (msg) => console.log("ticket:updated", msg));
socket.on("reservation:created", (msg) =>
  console.log("reservation:created", msg)
);
socket.on("reservation:updated", (msg) =>
  console.log("reservation:updated", msg)
);
socket.on("reservation:cancelled", (msg) =>
  console.log("reservation:cancelled", msg)
);
socket.on("disconnect", () => console.log("disconnected"));
