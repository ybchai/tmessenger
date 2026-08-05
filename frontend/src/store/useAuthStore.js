import { create } from "zustand";

import { axiosInstance } from "../lib/axios";

import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : window.location.origin;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  preferredLanguage: "en-US",
  isCheckingAuth: true,
  socket: null,
  onlineUsers: [],

  // Connect socket after PostgreSQL user is loaded
  connectSocket: (user, token) => {
    const existingSocket = get().socket;

    if (existingSocket) {
      console.log("Socket already exists");
      return;
    }

    if (!user?.id || !token) {
      console.error("Invalid socket auth", { user, token });
      return;
    }

    console.log("Connecting socket with user:", user.id);
    console.log("Token length:", token.length);
    console.log("Token prefix:", token.substring(0, 20) + "...");

    const socket = io(BASE_URL, {
      auth: {
        token,
      },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      console.error("Full error:", error);
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
      preferredLanguage: "en-US",
      socket: null,
    });
  },
}));
