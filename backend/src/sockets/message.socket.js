import {
  createMessage,
  updateConversationTimestamp,
} from "../repositories/message.repository.js";
import { translateText } from "../services/translation.service.js";

export function registerMessageSocket(io, socket) {
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, text } = data;

      const message = await createMessage({
        conversationId,
        senderId: socket.user.id,
        originalText: text,
        sourceLanguage: null,
        targetLanguage: null,
        imageUrl: null,
        videoUrl: null,
      });

      const translatedMessage = await translateText(message);

      await updateConversationTimestamp(conversationId);

      io.to(conversationId).emit("receive_message", translatedMessage);
    } catch (error) {
      console.error("Socket message error:", error);

      socket.emit("message_error", {
        error: "Failed to send message",
      });
    }
  });
}
