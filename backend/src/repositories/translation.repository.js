import { query } from "../database/connection.js";
import { ulid } from "ulid";

export async function createTranslation({
  messageId,
  languageCode,
  translatedText,
}) {
  const result = await query(
    `
INSERT INTO message_translations
(
    id,
    message_id,
    language_code,
    translated_text
)

VALUES
(
    $1,
    $2,
    $3,
    $4
)

ON CONFLICT(message_id, language_code)

DO UPDATE SET

translated_text = EXCLUDED.translated_text,
translated_at = NOW()

RETURNING *

`,
    [ulid(), messageId, languageCode, translatedText],
  );

  return result.rows[0];
}
