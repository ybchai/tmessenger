import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,

  isCheckingAuth: true,

  socket: null,

  // connect socket after PostgreSQL user is loaded
  connectSocket: (user) => {
    if (!user) return;

    // prevent duplicate connections
    if (get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: user.id,
      },

      withCredentials: true,
    });

    set({
      socket,
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

      // connect realtime after auth success
      get().connectSocket(user);
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
