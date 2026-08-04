import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,

  isCheckingAuth: true,

  socket: null,

  connectSocket: (token) => {
    if (!token) {
      console.error("No Clerk token provided");
      return;
    }

    if (get().socket?.connected) {
      return;
    }

    const socket = io(BASE_URL, {
      withCredentials: true,

      auth: {
        token,
      },
    });

    set({
      socket,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket error:", error.message);
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;

    if (socket) {
      socket.disconnect();
    }

    set({
      socket: null,
    });
  },

  checkAuth: async () => {
    set({
      isCheckingAuth: true,
    });

    try {
      const res = await axiosInstance.get("/auth/check");

      const user = res.data;

      set({
        authUser: user,
      });

      // connect socket after login

      get().connectSocket();
    } catch (error) {
      console.error("Auth check failed:", error.message);

      set({
        authUser: null,
      });
    } finally {
      set({
        isCheckingAuth: false,
      });
    }
  },

  clearAuth: () => {
    set({
      authUser: null,
    });

    get().disconnectSocket();
  },
}));
