CREATE TABLE IF NOT EXISTS conversation_participants (

    conversation_id CHAR(26)
        NOT NULL,

    user_id CHAR(26)
        NOT NULL,

    joined_at TIMESTAMPTZ
        DEFAULT NOW(),


    PRIMARY KEY (
        conversation_id,
        user_id
    ),


    CONSTRAINT fk_conversation_participant_conversation

        FOREIGN KEY (conversation_id)

        REFERENCES conversations(id)

        ON DELETE CASCADE,


    CONSTRAINT fk_conversation_participant_user

        FOREIGN KEY (user_id)

        REFERENCES users(id)

        ON DELETE CASCADE

);



CREATE INDEX IF NOT EXISTS idx_conversation_participants_user

ON conversation_participants(user_id);