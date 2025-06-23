import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import config from "../config";

let io: Server;

export const setupSocketIO = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: config.frontendUrl,
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("🟢 New client connected:", socket.id);
    });
};

export const getIO = () => {
    if (!io) throw new Error("Socket not initialized");
    return io;
};