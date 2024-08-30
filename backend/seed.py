import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import datetime, timedelta
import uuid
import random
from config import DB_CONFIG
from config import DB_SECRET_KEY

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def generate_random_color():
    return f"#{random.randint(0, 0xFFFFFF):06x}"

def seed_database():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Seed users
        users = [
            ("alice", "password123"),
            ("bob", "securepass456"),
            ("charlie", "strongpass789")
        ]
        for username, password in users:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cur.execute("""
                INSERT INTO users (username, password)
                VALUES (%s, %s)
                RETURNING id
            """, (username, hashed_password))
            user_id = cur.fetchone()['id']
            print(f"Created user: {username} with id: {user_id}")

        # Seed moods (10 moods)
        moods = ["Happy", "Sad", "Excited", "Calm", "Anxious", "Frustrated", "Energetic", "Tired", "Motivated", "Relaxed"]
        for mood in moods:
            cur.execute("INSERT INTO moods (name) VALUES (%s) RETURNING id", (mood,))
            mood_id = cur.fetchone()['id']
            print(f"Created mood: {mood} with id: {mood_id}")

        # Seed user_moods (10 moods per user)
        cur.execute("SELECT id FROM users")
        user_ids = [row['id'] for row in cur.fetchall()]
        cur.execute("SELECT id FROM moods")
        mood_ids = [row['id'] for row in cur.fetchall()]

        for user_id in user_ids:
            for mood_id in mood_ids:
                color = generate_random_color()
                cur.execute("""
                    INSERT INTO user_moods (user_id, mood_id, color)
                    VALUES (%s, %s, %s)
                    RETURNING id
                """, (user_id, mood_id, color))
                user_mood_id = cur.fetchone()['id']
                print(f"Created user_mood for user {user_id}, mood {mood_id} with id: {user_mood_id}")

        # Seed entries (100 entries per user within the past 100 days)
        current_date = datetime.now()
        for user_id in user_ids:
            cur.execute("SELECT id FROM user_moods WHERE user_id = %s", (user_id,))
            user_mood_ids = [row['id'] for row in cur.fetchall()]

            for i in range(100):
                entry_id = str(uuid.uuid4())
                date = current_date - timedelta(days=random.randint(0, 99))
                user_mood_id = random.choice(user_mood_ids)
                title = f"Entry {i+1} for user {user_id}"
                image_path = f"https://picsum.photos/300/600"
                entry_text = f"This is the text for entry {i+1} of user {user_id}. It's a longer entry to provide more substantial content for testing purposes."

                cur.execute("""
                    INSERT INTO entries (id, user_id, date, user_mood_id, title, image_path, entry_text)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (entry_id, user_id, date, user_mood_id, title, image_path, entry_text))
                print(f"Created entry: {entry_id} for user {user_id}")

                # Add 1-3 notes for each entry
                for j in range(random.randint(1, 3)):
                    note_text = f"This is note {j+1} for entry {entry_id}. Adding some variety to the notes for better testing."
                    cur.execute("""
                        INSERT INTO notes (entry_id, user_id, date, text)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """, (entry_id, user_id, date + timedelta(hours=j), note_text))
                    note_id = cur.fetchone()['id']
                    print(f"Created note: {note_id} for entry {entry_id}")

        conn.commit()
        print("Database seeded successfully with 10 moods per user and 100 entries per user within the past 100 days!")

    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()