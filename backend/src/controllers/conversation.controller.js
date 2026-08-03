import {
  findDirectConversation,
  createConversation,
  getUserConversations,
  getConversationParticipants,
} from "../repositories/conversation.repository.js";

/*
    Create or get existing DM conversation

    POST /api/conversations

    Body:
    {
        userId:"01USER..."
    }

*/

export async function createOrGetConversation(req, res) {
  try {
    const currentUserId = req.user.id;

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    // Prevent messaging yourself

    if (currentUserId === userId) {
      return res.status(400).json({
        error: "Cannot create conversation with yourself",
      });
    }

    // Check if DM already exists

    const existingConversation = await findDirectConversation(
      currentUserId,
      userId,
    );

    if (existingConversation) {
      return res.status(200).json({
        conversationId: existingConversation.id,
      });
    }

    // Create new conversation

    const conversationId = await createConversation(currentUserId, userId);

    res.status(201).json({
      conversationId,
    });
  } catch (error) {
    console.error("Create conversation error:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

/*
    Get sidebar conversations

    GET /api/conversations

*/

export async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const conversations = await getUserConversations(userId);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}

/*
    Get conversation members

    GET /api/conversations/:id/participants

*/

export async function getParticipants(req, res) {
  try {
    const { id } = req.params;

    const participants = await getConversationParticipants(id);

    res.status(200).json(participants);
  } catch (error) {
    console.error("Get participants error:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
