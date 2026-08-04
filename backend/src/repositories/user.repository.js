import { ulid } from "ulid";
import { query } from "../database/connection.js";

export async function findUserByClerkId(clerkId) {
  const result = await query(
    `
        SELECT
            id,
            clerk_id,
            email,
            full_name,
            profile_pic,
            preferred_language,
            created_at,
            updated_at

        FROM users

        WHERE clerk_id = $1

        AND deleted_at IS NULL
        `,

    [clerkId],
  );

  return result.rows[0];
}

export async function searchUsers(queryText, currentUserId) {
  const result = await query(
    `
    SELECT
        id,
        full_name,
        profile_pic,
        preferred_language

    FROM users

    WHERE deleted_at IS NULL

    AND id != $2

    AND (
        full_name ILIKE $1
        OR email ILIKE $1
    )

    LIMIT 20
    `,
    [`%${queryText}%`, currentUserId],
  );

  return result.rows;
}

export async function upsertUser({ clerkId, email, fullName, profilePic }) {
  const result = await query(
    `
        INSERT INTO users
        (
            id,
            clerk_id,
            email,
            full_name,
            profile_pic
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5
        )

        ON CONFLICT(clerk_id)

        DO UPDATE SET

            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            profile_pic = EXCLUDED.profile_pic,
            updated_at = NOW()

        RETURNING *
        `,

    [ulid(), clerkId, email, fullName, profilePic],
  );

  return result.rows[0];
}

export async function deactivateUserByClerkId(clerkId) {
  const result = await query(
    `
        UPDATE users

        SET deleted_at = NOW(),
            updated_at = NOW()

        WHERE clerk_id = $1

        RETURNING *
        `,

    [clerkId],
  );

  return result.rows[0];
}
