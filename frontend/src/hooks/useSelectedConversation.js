import { useMediaQuery } from "./useMediaQuery";
import { formatMessageTime } from "../lib/utils";

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// John Doe -> JD
export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function mapUserToConversation({ user, messages, authUser, onlineUsers = [] }) {
  const mappedMessages = messages.map((message) => ({
    id: message.id,
    role: String(message.sender_id) === String(authUser?.id) ? "me" : "them",
    text: message.text || "",
    time: formatMessageTime(message.created_at),
    imageUrl: message.image_url,
    videoUrl: message.video_url,
  }));

  return {
    id: user.id,

    peer: {
      id: user.id,
      name: user.full_name,
      subtitle: user.email,
      isOnline: onlineUsers.includes(user.id),
      avatarUrl: user.profile_pic,
      initials: getInitials(user.full_name),
    },

    messages: mappedMessages,
  };
}

export function useSelectedConversation() {
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  const conversations = useChatStore((state) => state.conversations);

  const users = useChatStore((state) => state.users);

  const messages = useChatStore((state) => state.messages);

  const authUser = useAuthStore((state) => state.authUser);

  const onlineUsers = useAuthStore((state) => state.onlineUsers || []);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const selectedConversation = activeConversationId
    ? conversations.find(
        (conversation) => conversation.id === activeConversationId,
      )
    : null;

  const selectedUser = activeConversationId
    ? users.find((user) => user.id === activeConversationId)
    : null;

  const activeConversation = selectedConversation
    ? {
        ...selectedConversation,

        messages: messages.map((message) => ({
          id: message.id,
          role:
            String(message.sender_id) === String(authUser?.id) ? "me" : "them",
          text: message.text || "",
          time: formatMessageTime(message.created_at),
          imageUrl: message.image_url,
          videoUrl: message.video_url,
        })),
      }
    : selectedUser
      ? mapUserToConversation({
          user: selectedUser,
          messages,
          authUser,
          onlineUsers,
        })
      : null;

  return {
    activeConversation,
    activeConversationId,
    isLargeScreen,
  };
}
