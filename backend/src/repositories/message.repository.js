import { query } from "../database/connection.js";
import { ulid } from "ulid";

export async function getMessagesByConversation(conversationId) {
  const result = await query(
    `
    SELECT

        m.id,

        m.conversation_id,

        m.sender_id,

        m.original_text,

        m.image_url,

        m.video_url,

        m.created_at,


        u.full_name AS sender_name,

        u.profile_pic AS sender_profile_pic


    FROM messages m


    JOIN users u

    ON m.sender_id = u.id



    WHERE m.conversation_id = $1


    ORDER BY m.created_at ASC

    `,

    [conversationId],
  );

  return result.rows;
}

export async function createMessage({
  conversationId,

  senderId,

  text,

  imageUrl,

  videoUrl,
}) {
  const messageId = ulid();

  const result = await query(
    `
    INSERT INTO messages

    (
        id,

        conversation_id,

        sender_id,

        original_text,

        image_url,

        video_url

    )


    VALUES

    ($1,$2,$3,$4,$5,$6)



    RETURNING *

    `,

    [messageId, conversationId, senderId, text, imageUrl, videoUrl],
  );

  return result.rows[0];
}

export async function updateConversationTimestamp(conversationId) {
  await query(
    `
    UPDATE conversations

    SET updated_at = NOW()

    WHERE id = $1

    `,

    [conversationId],
  );
}
