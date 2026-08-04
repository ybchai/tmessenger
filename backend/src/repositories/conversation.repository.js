import { ulid } from "ulid";
import { pool, query } from "../database/connection.js";

//Find existing direct conversation
export async function findDirectConversation(userId1, userId2) {
  const result = await query(
    `
    SELECT c.id

    FROM conversations c

    JOIN conversation_participants cp1
      ON cp1.conversation_id = c.id

    JOIN conversation_participants cp2
      ON cp2.conversation_id = c.id

    WHERE cp1.user_id = $1
      AND cp2.user_id = $2
      AND c.conversation_type = 'direct'

    LIMIT 1
    `,
    [userId1, userId2],
  );

  return result.rows[0] ?? null;
}

//Create Conversation
export async function createConversation(userId1, userId2) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const conversationId = ulid();

    await client.query(
      `
      INSERT INTO conversations
      (
        id,
        conversation_type
      )

      VALUES
      (
        $1,
        'direct'
      )
      `,
      [conversationId],
    );

    await client.query(
      `
      INSERT INTO conversation_participants
      (
        conversation_id,
        user_id
      )

      VALUES

      ($1,$2),

      ($1,$3)
      `,
      [conversationId, userId1, userId2],
    );

    await client.query("COMMIT");

    return conversationId;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

//Create or return existing conversation
export async function createOrGetConversation(userId1, userId2) {
  const existing = await findDirectConversation(userId1, userId2);

  if (existing) {
    return existing.id;
  }

  return await createConversation(userId1, userId2);
}

//Sidebar conversations
export async function getUserConversations(userId) {
  const result = await query(
    `
    SELECT

      c.id AS conversation_id,
      c.conversation_type,
      c.updated_at,

      u.id AS other_user_id,
      u.full_name,
      u.profile_pic,

      m.original_text AS last_message,
      m.sender_id AS last_sender_id,
      m.created_at AS last_message_at

    FROM conversations c

    JOIN conversation_participants cp
      ON cp.conversation_id = c.id

    JOIN conversation_participants cp2
      ON cp2.conversation_id = c.id

    JOIN users u
      ON u.id = cp2.user_id

    LEFT JOIN LATERAL (

      SELECT

        original_text,
        sender_id,
        created_at

      FROM messages

      WHERE conversation_id = c.id

      ORDER BY created_at DESC

      LIMIT 1

    ) m ON TRUE

    WHERE cp.user_id = $1
      AND cp2.user_id <> $1

    ORDER BY

      COALESCE(m.created_at, c.created_at) DESC
    `,
    [userId],
  );

  return result.rows;
}

// Conversation Participants
export async function getConversationParticipants(conversationId) {
  const result = await query(
    `
    SELECT

      u.id,
      u.full_name,
      u.profile_pic,
      u.preferred_language

    FROM conversation_participants cp

    JOIN users u

      ON u.id = cp.user_id

    WHERE cp.conversation_id = $1
    `,
    [conversationId],
  );

  return result.rows;
}

// Check membership
export async function isParticipant(conversationId, userId) {
  const result = await query(
    `
    SELECT 1

    FROM conversation_participants

    WHERE conversation_id = $1

      AND user_id = $2

    LIMIT 1
    `,
    [conversationId, userId],
  );

  return result.rowCount > 0;
}
