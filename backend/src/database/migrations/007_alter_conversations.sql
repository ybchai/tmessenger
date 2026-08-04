ALTER TABLE conversations

ADD COLUMN latest_message_id CHAR(26)

REFERENCES messages(id)

ON DELETE SET NULL;