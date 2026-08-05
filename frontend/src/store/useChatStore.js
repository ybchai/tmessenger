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
      const res = await axiosInstance.post("/conversations", { userId });

      const conversation = res.data;

      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.isTemporary && conv.other_user.id === userId) {
            return conversation;
          }

          return conv;
        }),

        activeConversationId: conversation.conversationId,

        selectedConversation: conversation,
      }));

      return conversation.conversationId;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  createTemporaryConversation: (user) => {
    const existing = get().conversations.find(
      (conv) => conv.isTemporary && conv.other_user.id === user.id,
    );

    if (existing) {
      set({
        activeConversationId: existing.conversation_id,

        selectedConversation: existing,

        messages: [],
      });

      return;
    }

    const tempConversation = {
      conversation_id: `temp-${user.id}`,
      isTemporary: true,
      other_user: user,
      latest_message: null,
    };

    set((state) => ({
      conversations: [tempConversation, ...state.conversations],

      activeConversationId: tempConversation.conversation_id,

      selectedConversation: tempConversation,

      messages: [],
    }));
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
      let realConversationId = conversationId;

      const conversation = get().conversations.find(
        (c) => c.conversation_id === conversationId,
      );

      // Temporary conversation
      if (conversation?.isTemporary) {
        realConversationId = await get().createConversation(
          conversation.other_user.id,
        );

        if (!realConversationId) {
          throw new Error("Failed to create conversation");
        }
      }

      const res = await axiosInstance.post(
        `/messages/${realConversationId}`,
        data,
      );

      set((state) => ({
        messages: [...state.messages, res.data],

        conversations: state.conversations.map((conv) => {
          if (conv.conversation_id === realConversationId) {
            return {
              ...conv,
              latest_message: res.data,
            };
          }

          return conv;
        }),
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
  },

  unsubscribeFromMessages: (conversationId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

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
    set((state) => ({
      activeConversationId: conversationId,

      selectedConversation: state.conversations.find(
        (conv) => conv.conversation_id === conversationId,
      ),

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
