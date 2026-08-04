import { useMediaQuery } from "./useMediaQuery";
import { formatMessageTime } from "../lib/utils";

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

  const onlineUsers = useAuthStore((state) => state.onlineUsers || []);

  const isLargeScreen = useMediaQuery("(min-width:1024px)");

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
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
          String(message.sender_id) === String(authUser?.id) ? "me" : "them",

        text: message.text || "",

        time: formatMessageTime(message.created_at),

        imageUrl: message.image_url,

        videoUrl: message.video_url,
      })),

      peer: activeConversation.peer
        ? {
            ...activeConversation.peer,

            isOnline: onlineUsers.includes(activeConversation.peer.id),
          }
        : null,
    },

    activeConversationId,

    isLargeScreen,
  };
}
