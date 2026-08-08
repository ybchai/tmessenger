import { Button, TextArea } from "@heroui/react";

import { ImageIcon, LoaderIcon, SendHorizontalIcon } from "lucide-react";

import { useRef } from "react";

import { useChatStore } from "../../store/useChatStore";

import { useSelectedConversation } from "../../hooks/useSelectedConversation";

export function ChatComposer() {
  const composerText = useChatStore((state) => state.composerText);

  const setComposerText = useChatStore((state) => state.setComposerText);

  const sendTextMessage = useChatStore((state) => state.sendTextMessage);

  const isSendingMessage = useChatStore((state) => state.isSendingMessage);

  const { activeConversationId } = useSelectedConversation();

  const mediaInputRef = useRef();

  const handleSend = () => {
    sendTextMessage(activeConversationId);
  };

  return (
    <footer
      className="
      w-full
      border-t
      border-border
      p-2
      "
    >
      <div
        className="
        flex
        w-full
        gap-2
        "
      >
        <input ref={mediaInputRef} type="file" className="hidden" />

        <Button isIconOnly onPress={() => mediaInputRef.current.click()}>
          <ImageIcon />
        </Button>

        <TextArea fullWidth
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();

              handleSend();
            }
          }}
          placeholder="Message"
        />

        <Button isIconOnly disabled={!composerText.trim()} onPress={handleSend}>
          <SendHorizontalIcon />
        </Button>
      </div>
    </footer>
  );
}
