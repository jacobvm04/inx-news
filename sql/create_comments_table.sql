CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    author VARCHAR (50) NOT NULL,
    content TEXT NOT NULL,
    post SERIAL REFERENCES submissions(id) ON DELETE CASCADE
);
