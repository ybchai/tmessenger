CREATE TABLE IF NOT EXISTS users (

    id CHAR(26) PRIMARY KEY,

    clerk_id VARCHAR(255)
        UNIQUE NOT NULL,

    email VARCHAR(255)
        UNIQUE NOT NULL,

    full_name VARCHAR(100)
        NOT NULL,

    profile_pic TEXT DEFAULT '',

    preferred_language VARCHAR(10)
        DEFAULT 'en',

    deleted_at TIMESTAMPTZ DEFAULT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()

);


CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);


CREATE INDEX IF NOT EXISTS idx_users_clerk_id
ON users(clerk_id);