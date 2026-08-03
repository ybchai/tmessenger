import { query } from "../../shared/database/connection.js";
import { ulid } from "ulid";

export async function findDirectConversation(userId1, userId2) {
  const result = await query(
    `
        SELECT c.id


        FROM conversations c


        JOIN conversation_participants cp1

        ON c.id = cp1.conversation_id


        JOIN conversation_participants cp2

        ON c.id = cp2.conversation_id



        WHERE cp1.user_id = $1

        AND cp2.user_id = $2


        AND c.conversation_type = 'direct'


        LIMIT 1

        `,

    [userId1, userId2],
  );

  return result.rows[0];
}

export async function createConversation(userId1, userId2) {
  const conversationId = ulid();

  // create conversation

  await query(
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

  // add participants

  await query(
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

  return conversationId;
}

export async function getUserConversations(userId) {
  const result = await query(
    `
        SELECT

            c.id AS conversation_id,

            c.conversation_type,

            c.updated_at,


            u.id AS other_user_id,

            u.full_name,

            u.profile_pic


        FROM conversations c



        JOIN conversation_participants cp


        ON c.id = cp.conversation_id



        JOIN conversation_participants cp2


        ON c.id = cp2.conversation_id



        JOIN users u


        ON cp2.user_id = u.id



        WHERE cp.user_id = $1


        AND cp2.user_id != $1



        ORDER BY c.updated_at DESC

        `,

    [userId],
  );

  return result.rows;
}

export async function getConversationParticipants(conversationId) {
  const result = await query(
    `
        SELECT

            u.id,

            u.full_name,

            u.profile_pic


        FROM conversation_participants cp


        JOIN users u


        ON cp.user_id = u.id



        WHERE cp.conversation_id = $1

        `,

    [conversationId],
  );

  return result.rows;
}
