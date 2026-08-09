import { create } from "zustand";

import { axiosInstance } from "../lib/axios";

import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : window.location.origin;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  preferredLanguage: "en",
  isCheckingAuth: true,
  socket: null,
  onlineUsers: [],

  // Connect socket after PostgreSQL user is loaded
  connectSocket: (user, token) => {
    const oldSocket = get().socket;

    if (oldSocket) {
      oldSocket.disconnect();
      console.log("Old socket disconnected");
    }

    if (!user?.id || !token) {
      console.error("Invalid socket auth", { user, token });
      return;
    }

    const socket = io(BASE_URL, {
      auth: {
        token,
      },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    set({
      socket,
      authUser: user,
    });
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      const user = res.data;

      set({
        authUser: user,
        isCheckingAuth: false,
      });

      return user;
    } catch (error) {
      set({
        authUser: null,
        isCheckingAuth: false,
      });

      return null;
    }
  },

  setAuthUser: (user) =>
    set({
      authUser: user,
      isCheckingAuth: false,
    }),

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

      set((state) => ({
        authUser: {
          ...state.authUser,
          preferred_language: language,
        },
      }));

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
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

  clearAuth: () => {
    const socket = get().socket;

    if (socket) {
      socket.disconnect();
    }

    set({
      authUser: null,
      preferredLanguage: "en",
      socket: null,
    });
  },
}));
