CREATE TABLE IF NOT EXISTS conversations (

    id CHAR(26) PRIMARY KEY,

    conversation_type VARCHAR(20)
        NOT NULL
        DEFAULT 'direct'
        CHECK (
            conversation_type = 'direct'
        ),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()

);


CREATE INDEX IF NOT EXISTS idx_conversation_type
ON conversations(conversation_type);