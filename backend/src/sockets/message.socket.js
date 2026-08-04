import {
  createMessage,
  updateConversationTimestamp,
} from "../repositories/message.repository.js";

export function registerMessageSocket(io, socket) {
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, text } = data;

      const message = await createMessage({
        conversationId,

        senderId: socket.user.id,

        originalText: text,

        imageUrl: null,

        videoUrl: null,
      });

      await updateConversationTimestamp(conversationId);

      io.to(conversationId).emit("receive_message", message);
    } catch (error) {
      console.error("Socket message error:", error);

      socket.emit("message_error", {
        error: "Failed to send message",
      });
    }
  });
}
