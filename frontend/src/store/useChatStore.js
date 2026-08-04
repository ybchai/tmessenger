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
    if (!conversationId) return;

    set({
      isMessagesLoading: true,
    });

    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`);

      set({
        messages: res.data,
      });
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      set({
        isMessagesLoading: false,
      });
    }
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
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.emit("join_conversation", conversationId);

    socket.off("receive_message");

    socket.on("receive_message", (message) => {
      if (message.conversation_id !== conversationId) {
        return;
      }

      set((state) => ({
        messages: [...state.messages, message],
      }));
    });
  },

  unsubscribeFromMessages: (conversationId) => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.emit("leave_conversation", conversationId);

    socket.off("receive_message");
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
    set((state) => ({
      activeConversationId: conversationId,

      selectedConversation:
        state.conversations.find(
          (conversation) => conversation.conversation_id === conversationId,
        ) || null,

      messages: [],
    }));
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
