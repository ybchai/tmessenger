CREATE TABLE IF NOT EXISTS messages (

    id CHAR(26) PRIMARY KEY,

    conversation_id CHAR(26)
        NOT NULL,

    sender_id CHAR(26)
        NOT NULL,

    original_text TEXT,

    image_url TEXT,

    video_url TEXT,

    created_at TIMESTAMPTZ
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        DEFAULT NOW(),


    CONSTRAINT fk_message_conversation

    FOREIGN KEY(conversation_id)

    REFERENCES conversations(id)

    ON DELETE CASCADE,


    CONSTRAINT fk_message_sender

    FOREIGN KEY(sender_id)

    REFERENCES users(id)

    ON DELETE CASCADE

);

CREATE INDEX idx_messages_conversation
ON messages(conversation_id);

CREATE INDEX idx_messages_sender
ON messages(sender_id);

CREATE INDEX idx_messages_created
ON messages(created_at);