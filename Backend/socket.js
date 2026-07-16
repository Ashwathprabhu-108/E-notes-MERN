// socket.js — singleton io instance shared across routes/controllers
import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "https://e-notes-mern-nine.vercel.app",
        "https://e-notes-mern-admin.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("[Socket] Admin connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("[Socket] Admin disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialised");
  return io;
};
