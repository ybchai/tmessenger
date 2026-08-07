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

      messages,

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
