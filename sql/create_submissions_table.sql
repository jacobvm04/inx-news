CREATE TABLE IF NOT EXISTS submissions (
    id serial PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    link TEXT NOT NULL,
    votes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    author VARCHAR(50) NOT NULL
);
