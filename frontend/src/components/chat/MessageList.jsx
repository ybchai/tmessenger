import useScrollToBottom from "../../hooks/useScrollToBottom";

import { MessageBubble } from "./MessageBubble";

import { NoConversationPlaceholder } from "./NoConversationPlaceholder";

import { useSelectedConversation } from "../../hooks/useSelectedConversation";

import { useChatStore } from "../../store/useChatStore";

export function MessageList() {
  const { activeConversation, activeConversationId } =
    useSelectedConversation();

  const messages = useChatStore((state) => state.messages);

  console.log("MESSAGE LIST RENDER", messages);

  const lastMessageId = messages.at(-1)?.id;

  console.log("Latest Message", lastMessageId);

  const messagesScrollRef = useScrollToBottom(
    activeConversationId,
    lastMessageId,
  );

  return (
    <div
      className="
flex
flex-1
overflow-hidden
flex-col
"
    >
      {activeConversation ? (
        <div
          ref={messagesScrollRef}
          className="
flex-1
overflow-y-auto
p-3
"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ) : (
        <NoConversationPlaceholder />
      )}
    </div>
  );
}
