import { useWallpaper } from "../context/wallpaper";
import { useChatStore } from "../store/useChatStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";

import { useEffect } from "react";

import ChatSidebar from "../components/chat/ChatSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { ChatComposer } from "../components/chat/ChatComposer";

function ChatPage() {
  const { frameStyle } = useWallpaper();

  const { activeConversationId, isLargeScreen } = useSelectedConversation();

  // Initial sidebar loading
  useEffect(() => {
    const getUsers = useChatStore.getState().getUsers;
    const getConversations = useChatStore.getState().getConversations;

    getUsers();
    getConversations();
  }, []);

  // Load messages + socket room
  useEffect(() => {
    if (!activeConversationId) return;

    const getMessages = useChatStore.getState().getMessages;
    const subscribeToMessages = useChatStore.getState().subscribeToMessages;
    const unsubscribeFromMessages =
      useChatStore.getState().unsubscribeFromMessages;

    getMessages(activeConversationId);

    subscribeToMessages(activeConversationId);

    return () => {
      unsubscribeFromMessages(activeConversationId);
    };
  }, [activeConversationId]);

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden p-2 sm:p-3 md:p-8"
      style={frameStyle}
    >
      <div
        className="
        mx-auto
        flex
        w-full
        max-w-6xl
        flex-1
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-background
        text-foreground
      "
      >
        <ChatSidebar />

        <div
          className={`
          flex-1
          flex-col
          overflow-hidden

          ${!isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"}
          `}
        >
          <ChatHeader />

          <MessageList />

          {activeConversationId && <ChatComposer />}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
