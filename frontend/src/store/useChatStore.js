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
  isSendingMessage: false,

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

      console.log("created conversation:", conversation);

      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.isTemporary && conv.other_user.id === userId) {
            return {
              ...conversation,

              // keep sidebar compatible
              peer: conv.other_user,

              id: conversation.conversationId,
              isTemporary: false,
            };
          }

          return conv;
        }),
      }));

      return conversation.conversationId;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  createTemporaryConversation: (user) => {
    const tempConversation = {
      conversation_id: `temp-${user.id}`,
      conversation_type: "direct",
      other_user_id: user.id,
      full_name: user.full_name,
      profile_pic: user.profile_pic,
      last_message: null,
      last_message_at: null,
      isTemporary: true,
    };

    set((state) => ({
      conversations: [tempConversation, ...state.conversations],
      activeConversationId: tempConversation.conversation_id,
      selectedConversation: tempConversation,
      messages: [],
    }));
  },

  getConversations: async () => {
    console.log("GET CONVERSATIONS CALLED");

    set({
      isConversationsLoading: true,
    });

    try {
      const res = await axiosInstance.get("/conversations");

      console.log("Backend conversations:", res.data);

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
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`);

      console.log("RAW MESSAGES:", res.data);

      const currentUser = useAuthStore.getState().authUser;

      console.log("CURRENT USER:", currentUser);

      const mappedMessages = res.data.map((message) => ({
        id: message.id,

        role: message.sender_id === currentUser?.id ? "me" : "other",

        text: message.text,

        time: new Date(message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),

        imageUrl: message.image_url,
        videoUrl: message.video_url,
      }));

      set({
        messages: mappedMessages,
      });
    } catch (error) {
      console.error("Get messages error:", error);
    }
  },

  // SEND MESSAGE
  sendMessage: async ({ conversationId, data }) => {
    try {
      set({
        isSendingMessage: true,
      });

      await axiosInstance.post(`/messages/${conversationId}`, data);

      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
      return false;
    } finally {
      set({
        isSendingMessage: false,
      });
    }
  },

  // SOCKET LISTENER
  subscribeToMessages: (conversationId) => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.emit("join_conversation", conversationId);

    socket.off("receive_message");

    socket.on("receive_message", (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });
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

  setActiveConversationId: async (conversationId) => {
    set({
      activeConversationId: conversationId,
      messages: [],
    });

    // Load old messages
    await get().getMessages(conversationId);

    // Join socket room for new messages
    get().subscribeToMessages(conversationId);
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

    set({
      composerText: "",
    });

    const success = await get().sendMessage({
      conversationId,
      data: {
        text,
      },
    });

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
