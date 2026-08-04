import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,

  isCheckingAuth: true,

  socket: null,

  connectSocket: (user) => {
    if (!user) return;

    if (get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,

      query: {
        userId: user.id,
      },
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

  updatePreferredLanguage: async (language) => {
    try {
      const res = await axiosInstance.put(
        "/users/language",

        {
          language,
        },
      );

      set({
        authUser: {
          ...get().authUser,

          preferred_language: res.data.preferred_language,
        },
      });
    } catch (error) {
      console.error("Update language failed:", error.message);

      throw error;
    }
  },

  clearAuth: () => {
    set({
      authUser: null,
    });

    get().disconnectSocket();
  },
}));
