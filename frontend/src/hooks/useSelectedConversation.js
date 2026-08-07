import { useMediaQuery } from "./useMediaQuery";

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function useSelectedConversation() {
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  const conversations = useChatStore((state) => state.conversations);

  const messages = useChatStore((state) => state.messages);

  const authUser = useAuthStore((state) => state.authUser);

  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const isLargeScreen = useMediaQuery("(min-width:1024px)");

  const activeConversation = conversations.find(
    (conversation) => conversation.conversation_id === activeConversationId,
  );

  if (!activeConversation) {
    return {
      activeConversation: null,
      activeConversationId,
      isLargeScreen,
    };
  }

  return {
    activeConversation: {
      ...activeConversation,

      messages: messages.map((message) => ({
        id: message.id,

        role:
          String(message.sender_id) === String(authUser?.id) ? "me" : "other",

        originalText: message.originalText ?? message.original_text,

        translatedText: message.translatedText ?? message.translated_text,

        sourceLanguage: message.sourceLanguage ?? message.source_language,

        targetLanguage: message.targetLanguage ?? message.target_language,

        time:
          message.time ??
          new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),

        imageUrl: message.imageUrl ?? message.image_url,

        videoUrl: message.videoUrl ?? message.video_url,
      })),

      peer: {
        id: activeConversation.other_user_id,
        full_name: activeConversation.full_name,
        profile_pic: activeConversation.profile_pic,
        isOnline: onlineUsers.includes(activeConversation.other_user_id),
      },
    },

    activeConversationId,
    isLargeScreen,
  };
}
