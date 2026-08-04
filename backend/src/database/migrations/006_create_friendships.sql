CREATE TABLE friendships (

    id CHAR(26) PRIMARY KEY,

    requester_id CHAR(26)
        NOT NULL
        REFERENCES users(id),

    receiver_id CHAR(26)
        NOT NULL
        REFERENCES users(id),


    status VARCHAR(20)
        NOT NULL
        DEFAULT 'pending',


    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW(),


    UNIQUE(requester_id, receiver_id)

);