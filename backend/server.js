// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { connectDB } from "./db.js";
import router from "./src/routes/index.js";
import { notFound, errorHandler } from "./src/middleware/error.js";
import accountRoutes from "./src/routes/account.routes.js";

const app = express();

// CORS
const origins = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim());
app.use(
  cors({
    origin: origins?.length ? origins : true,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// health
app.get("/", (_req, res) => res.send("Backend API working!"));
// API
app.use("/api", router);

app.use("/api/account", accountRoutes);

// error handlers
app.use(notFound);
app.use(errorHandler);

// --- Socket.IO (HTTPサーバ経由で初期化)
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: origins?.length ? origins : true },
});

// どこからでも emit できるよう app.locals に載せる
app.locals.io = io;

io.on("connection", (socket) => {
  console.log("🔌 socket connected:", socket.id);
  // 追加: 店舗ルームに参加（storeIdはログイン後にクライアントから送る）
  socket.on("joinStore", (storeId) => {
    if (storeId) socket.join(`store:${storeId}`);
  });
  // デバッグ用
  socket.on("ping", () => socket.emit("pong"));
  socket.on("disconnect", () =>
    console.log("🔌 socket disconnected:", socket.id)
  );
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("✅ Mongo connected");
  } catch (err) {
    console.warn(`⚠️ Mongo connection failed: ${err.message}`);
    console.warn("Proceeding without database connection. Check MONGO_URI.");
  }
  server.listen(PORT, HOST, () =>
    console.log(`✅ Server http://${HOST}:${PORT}`)
  );
}

startServer();
