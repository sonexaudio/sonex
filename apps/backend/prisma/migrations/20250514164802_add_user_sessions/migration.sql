-- Create secret user sessions table to store auth session
CREATE TABLE IF NOT EXISTS "user_sessions" (
    sid varchar NOT NULL COLLATE "default",
    sess json NOT NULL,
    expire timestamp(6) NOT NULL
);

ALTER TABLE "user_sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY (sid);

CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expire" ON "user_sessions" ("expire");