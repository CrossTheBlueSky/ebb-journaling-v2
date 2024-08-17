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

def drop_and_create_tables():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DROP TABLE IF EXISTS users, moods, user_moods, entries, notes;')
    cur.execute('''
-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create the moods table for general moods
CREATE TABLE IF NOT EXISTS moods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create the user_moods table for user-specific mood settings
CREATE TABLE IF NOT EXISTS user_moods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    mood_id INTEGER REFERENCES moods(id),
    color VARCHAR(50) NOT NULL,
    UNIQUE (user_id, mood_id)
);

-- Create the entries table
CREATE TABLE IF NOT EXISTS entries (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date VARCHAR(255) NOT NULL,
    user_mood_id INTEGER REFERENCES user_moods(id),
    title VARCHAR(255) NOT NULL,
    image_path TEXT,
    entry_text TEXT NOT NULL
);

-- Create the notes table
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    entry_id VARCHAR(255) REFERENCES entries(id),
    date VARCHAR(255) NOT NULL,
    text TEXT NOT NULL
);
    ''')

#create test user

    cur.execute('INSERT INTO users (name) VALUES (%s)', ('Test User',))
    conn.commit()
    cur.close()
    conn.close()

drop_and_create_tables()