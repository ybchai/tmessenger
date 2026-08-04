import { create } from "zustand";

import { axiosInstance } from "../lib/axios";

import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,

  preferredLanguage: "en",

  isCheckingAuth: true,

  socket: null,

  // Connect socket after PostgreSQL user is loaded
  connectSocket: (user) => {
    console.log("CONNECT SOCKET USER:", user);

    if (!user || !user.id) {
      console.error("Socket connection cancelled. Invalid user:", user);
      return;
    }

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
        preferredLanguage: user.preferred_language || "en",
      });

      return user;
    } catch (error) {
      console.error("Auth check failed:", error.message);

      set({
        authUser: null,
        preferredLanguage: "en",
      });

      return null;
    } finally {
      set({
        isCheckingAuth: false,
      });
    }
  },

  updatePreferredLanguage: async (language) => {
    try {
      set((state) => ({
        preferredLanguage: language,

        authUser: {
          ...state.authUser,
          preferred_language: language,
        },
      }));

      await axiosInstance.patch("/users/preferences", {
        preferredLanguage: language,
      });

      return true;
    } catch (error) {
      console.error(
        "Update preferred language failed:",
        error.response?.data || error.message,
      );

      return false;
    }
  },

  clearAuth: () => {
    set({
      authUser: null,

      preferredLanguage: "en",
    });

    get().disconnectSocket();
  },
}));
