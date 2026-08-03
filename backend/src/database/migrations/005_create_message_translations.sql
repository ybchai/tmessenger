CREATE TABLE IF NOT EXISTS message_translations (

    id CHAR(26) PRIMARY KEY,


    message_id CHAR(26)
        NOT NULL,


    language_code VARCHAR(10)
        NOT NULL,


    translated_text TEXT
        NOT NULL,


    is_auto BOOLEAN
        DEFAULT TRUE,


    translated_at TIMESTAMPTZ
        DEFAULT NOW(),



    CONSTRAINT fk_translation_message

    FOREIGN KEY(message_id)

    REFERENCES messages(id)

    ON DELETE CASCADE,



    CONSTRAINT unique_message_language

    UNIQUE(message_id, language_code)

);


CREATE INDEX IF NOT EXISTS idx_translation_message

ON message_translations(message_id);