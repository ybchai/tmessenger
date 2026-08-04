import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  users: [],
  conversations: [],
  messages: [],
  selectedUser: null,
  selectedConversation: null,
  activeConversationId: null,
  searchQuery: "",
  sidebarTab: "chats",
  composerText: "",
  isConversationsLoading: false,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMedia: false,

  // USERS
  getUsers: async () => {
    set({
      isUsersLoading: true,
    });

    try {
      const res = await axiosInstance.get(
        `/users/search?q=${get().searchQuery}`,
      );

      set({
        users: res.data,
      });
    } catch (error) {
      console.log("Error fetching users:", error.message);
    } finally {
      set({
        isUsersLoading: false,
      });
    }
  },

  // CONVERSATIONS
  createConversation: async (userId) => {
    try {
      const res = await axiosInstance.post("/conversations", {
        userId,
      });

      const conversationId = res.data.conversationId;

      await get().getConversations();

      set({
        activeConversationId: conversationId,
      });

      return conversationId;
    } catch (error) {
      console.error(
        "Create conversation failed:",
        error.response?.data || error.message,
      );

      return null;
    }
  },

  getConversations: async () => {
    set({
      isConversationsLoading: true,
    });

    try {
      const res = await axiosInstance.get("/conversations");

      set({
        conversations: res.data,
      });
    } catch (error) {
      console.log("Error fetching conversations:", error.message);
    } finally {
      set({
        isConversationsLoading: false,
      });
    }
  },

  // MESSAGES
  getMessages: async (conversationId) => {
    const res = await axiosInstance.get(`/messages/${conversationId}`);

    set({
      messages: res.data,
    });
  },

  // SEND MESSAGE
  sendMessage: async ({ conversationId, data }) => {
    try {
      const res = await axiosInstance.post(`/messages/${conversationId}`, data);

      set((state) => ({
        messages: [...state.messages, res.data],
      }));

      return true;
    } catch (error) {
      console.error("Send message error:", error.message);

      toast.error("Failed to send message");

      return false;
    }
  },

  // SOCKET LISTENER
  subscribeToMessages: (conversationId) => {
    socket.emit("join_conversation", conversationId);
  },

  unsubscribeFromMessages: (conversationId) => {
    socket.emit("leave_conversation", conversationId);
  },

  // SEARCH
  searchUsers: async (query) => {
    if (!query.trim()) {
      set({
        users: [],
      });

      return;
    }

    try {
      const res = await axiosInstance.get(`/users/search?q=${query}`);

      set({
        users: res.data,
      });
    } catch (error) {
      console.log("Search users error", error.message);
    }
  },

  // SELECT
  setSelectedUser: (selectedUser) => {
    set({
      selectedUser,
    });
  },

  setActiveConversationId: (conversationId) => {
    set({
      activeConversationId: conversationId,
      messages: [],
    });
  },

  // UI
  setSearchQuery: (searchQuery) => {
    set({
      searchQuery,
    });
  },

  setSidebarTab: (sidebarTab) => {
    set({
      sidebarTab,
    });
  },

  setComposerText: (composerText) => {
    set({
      composerText,
    });
  },

  // SEND TEXT
  sendTextMessage: async (conversationId) => {
    const text = get().composerText.trim();

    if (!conversationId || !text) {
      return false;
    }

    const success = await get().sendMessage({
      conversationId,

      data: {
        text,
      },
    });

    if (success) {
      set({
        composerText: "",
      });
    }

    return success;
  },

  // SEND MEDIA
  sendMediaMessage: async ({ conversationId, file }) => {
    if (!conversationId || !file) {
      return false;
    }

    const formData = new FormData();

    formData.append("media", file);

    set({
      isSendingMedia: true,
    });

    try {
      return await get().sendMessage({
        conversationId,

        data: formData,
      });
    } finally {
      set({
        isSendingMedia: false,
      });
    }
  },
}));
