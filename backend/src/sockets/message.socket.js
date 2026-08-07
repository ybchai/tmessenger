export function registerMessageSocket(io, socket) {
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);

    console.log(`${socket.user.id} joined ${conversationId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.user.id);
  });
}
