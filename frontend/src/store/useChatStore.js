import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { EqualSquareIcon } from "lucide-react";

// Shared mapper: converts a raw DB/socket row (snake_case) into the shape
// MessageBubble expects (camelCase + computed "role"/"time").
function mapMessage(message, currentUserId) {
  console.log("COMPARE ROLE", {
    sender: message.sender_id,
    current: currentUserId,
    equal: String(message.sender_id) === String(currentUserId),
  });

  return {
    id: message.id,

    role: String(message.sender_id) === String(currentUserId) ? "me" : "other",

    originalText: message.originalText ?? message.original_text ?? "",

    translatedText: message.translatedText ?? message.translated_text ?? null,

    sourceLanguage: message.sourceLanguage ?? message.source_language ?? null,

    targetLanguage: message.targetLanguage ?? message.target_language ?? null,

    time:
      message.time ??
      new Date(message.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

    imageUrl: message.imageUrl ?? message.image_url ?? null,

    videoUrl: message.videoUrl ?? message.video_url ?? null,
  };
}

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

      console.log("CREATE CONVERSATION RESPONSE:", conversation);

      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.isTemporary && conv.other_user_id === userId) {
            return {
              ...conversation,

              conversation_id: conversation.conversationId,

              other_user_id: conv.other_user_id,
              full_name: conv.full_name,
              profile_pic: conv.profile_pic,

              isTemporary: false,
            };
          }

          return conv;
        }),
      }));

      return conversation.conversationId;
    } catch (error) {
      console.error(
        "Create conversation error:",
        error.response?.data || error,
      );

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

      console.log("FIRST RAW MESSAGES:", res.data[0]);
      console.log(JSON.stringify(res.data[0], null, 2));

      const currentUser = useAuthStore.getState().authUser;

      console.log("CURRENT USER:", currentUser);

      const mappedMessages = res.data.map((message) =>
        mapMessage(message, currentUser?.id),
      );

      console.log("FIRST MAPPED");
      console.log(mappedMessages[0]);

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
      set({ isSendingMessage: true });

      await axiosInstance.post(`/messages/${conversationId}`, data);

      return true;
    } catch (error) {
      console.error("Send message error:", error);
      return false;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // SOCKET LISTENER
  subscribeToMessages: (conversationId) => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    const handleMessage = (message) => {
      console.log("RAW SOCKET:", message);

      const currentUser = useAuthStore.getState().authUser;

      const mappedMessage = mapMessage(message, currentUser.id);

      set((state) => {
        const exists = state.messages.some((m) => m.id === mappedMessage.id);

        if (exists) {
          return state;
        }

        return {
          messages: [...state.messages, mappedMessage],
        };
      });
    };

    // remove old listeners first
    socket.off("receive_message");

    // join new room
    socket.emit("join_conversation", conversationId);

    // add new listener
    socket.on("receive_message", handleMessage);
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

  setActiveConversationId: async (conversationId) => {
    const conversation = get().conversations.find(
      (conv) => conv.conversation_id === conversationId,
    );

    set({
      activeConversationId: conversationId,
      selectedConversation: conversation,
      messages: [],
    });

    if (conversation?.isTemporary) {
      return;
    }

    await get().getMessages(conversationId);
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

    let realConversationId = conversationId;

    const conversation = get().conversations.find(
      (conv) => conv.conversation_id === conversationId,
    );

    console.log("SEND CONVERSATION:", conversation);
    console.log("SEND CONVERSATION ID:", conversationId);

    // Temporary conversation
    if (conversation?.isTemporary) {
      console.log("TEMPORARY CONVERSATION");

      const createdConversationId = await get().createConversation(
        conversation.other_user_id,
      );

      console.log("CREATED REAL CONVERSATION:", createdConversationId);

      if (!createdConversationId) {
        console.error("Could not create real conversation");
        return false;
      }

      // IMPORTANT
      realConversationId = createdConversationId;

      console.log("USING REAL CONVERSATION:", realConversationId);

      set({
        activeConversationId: realConversationId,
        composerText: "",
      });

      await get().getConversations();
      await get().getMessages(realConversationId);
      get().subscribeToMessages(realConversationId);
    } else {
      set({
        composerText: "",
      });
    }

    console.log("FINAL MESSAGE CONVERSATION ID:", realConversationId);

    return await get().sendMessage({
      conversationId: realConversationId,
      data: {
        text,
      },
    });
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
