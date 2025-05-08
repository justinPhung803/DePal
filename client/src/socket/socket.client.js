import io from 'socket.io-client';
import toast from "react-hot-toast"

const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

let socket = null;

export const initializeSocket = (userId) => {
    if (socket) {
      socket.disconnect();
    }
  
    socket = io(SOCKET_URL, {
      auth: { userId },
    });
  
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });
  
    socket.on("newMessage", ({ message }) => {
      console.log("📩 New message received:", message);
      toast.success(`📩 ${message.content}`);
    });
  };

export const getSocket = () => {
    if(!socket) {
        throw new Error("Socket not initialized")
    }
    return socket;
};

export const disconnectSocket = () => {
    if(socket) {
        socket.disconnect();
        socket = null;
    }
};