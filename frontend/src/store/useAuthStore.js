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
    if (!user) return;

    if (get().socket?.connected) return;

    console.log("Connecting socket user:", user);

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

      // connect realtime
      get().connectSocket(user);
    } catch (error) {
      console.error("Auth check failed:", error.message);

      set({
        authUser: null,

        preferredLanguage: "en",
      });
    } finally {
      set({
        isCheckingAuth: false,
      });
    }
  },

  updatePreferredLanguage: async (language) => {
    try {
      await axiosInstance.patch(
        "/users/preferences",

        {
          preferredLanguage: language,
        },
      );

      set((state) => ({
        preferredLanguage: language,

        authUser: {
          ...state.authUser,

          preferred_language: language,
        },
      }));

      return true;
    } catch (error) {
      console.error(
        "Update preferred language failed:",

        error.message,
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
