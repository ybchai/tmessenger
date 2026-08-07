import useScrollToBottom from "../../hooks/useScrollToBottom";

import { MessageBubble } from "./MessageBubble";

import { NoConversationPlaceholder } from "./NoConversationPlaceholder";

import { useSelectedConversation } from "../../hooks/useSelectedConversation";

import { useChatStore } from "../../store/useChatStore";

export function MessageList() {
  const { activeConversation, activeConversationId } =
    useSelectedConversation();

  console.log("ACTIVE CONVERSATION:", activeConversation);

  console.log("ACTIVE ID:", activeConversationId);

  const messages = useChatStore((state) => state.messages);

  console.log(JSON.stringify(messages[0], null, 2));

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
            <div key={message.id}>
              TEST:
              {message.originalText}
            </div>
          ))}
        </div>
      ) : (
        <NoConversationPlaceholder />
      )}
    </div>
  );
}
