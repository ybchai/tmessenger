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

    const socket = io(BASE_URL, {
      auth: {
        token,
      },
      withCredentials: true,
      transports: ["polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    set({ socket });
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      console.log("BEFORE AUTH SET");
      const user = res.data;
      console.log("SETTING AUTH USER", user);
      console.log("CHECK AUTH START");
      set({
        authUser: user,
        preferredLanguage: user.preferred_language || "en",
        isCheckingAuth: false,
      });
      console.log("CHECK AUTH STATE");

      return user;
    } catch (error) {
      console.error("Auth check failed:", error.message);

      set({
        authUser: null,
        preferredLanguage: "en",
        isCheckingAuth: false,
      });

      return null;
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
