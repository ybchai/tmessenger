export function registerConversationSocket(io, socket) {
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);

    console.log(`${socket.user.id} joined conversation ${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);

    console.log(`${socket.user.id} left conversation ${conversationId}`);
  });
}
