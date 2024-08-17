import psycopg2
from config import DB_CONFIG

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# Test connection
try:
    conn = get_db_connection()
    print("Connection successful")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")

# Create Tables

def create_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create the user_moods table
CREATE TABLE IF NOT EXISTS user_moods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    UNIQUE (user_id, name),
    UNIQUE (user_id, color)
);

-- Create the entries table
CREATE TABLE IF NOT EXISTS entries (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    user_mood_id INTEGER REFERENCES user_moods(id),
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    entry_text TEXT NOT NULL
);

-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    entry_id VARCHAR(255) REFERENCES entries(id),
    date DATE NOT NULL,
    text TEXT NOT NULL
);
    ''')
    conn.commit()
    cur.close()
    conn.close()

create_tables()