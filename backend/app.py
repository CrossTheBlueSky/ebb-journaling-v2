from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid
from flask_cors import CORS
from config import DB_CONFIG

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure UPLOAD_FOLDER is defined and the directory exists
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

connection_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=f"dbname={DB_CONFIG['dbname']} host={DB_CONFIG['host']} port={DB_CONFIG['port']} user={DB_CONFIG['user']} password={DB_CONFIG['password']}",
)

def get_connection():
    return connection_pool.getconn()

def release_connection(conn):
    connection_pool.putconn(conn)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
@app.errorhandler(Exception)
def handle_exception(e):
    # Log the error
    app.logger.error(f"Unhandled exception: {str(e)}")
    # Return JSON instead of HTML for HTTP errors
    return jsonify(error=str(e)), 500

@app.route('/api/entries', methods=['GET', 'POST'])
def entries():
    try:
        if request.method == 'GET':
            user_id = request.args.get('userId')
            start_date = request.args.get('startDate')
            end_date = request.args.get('endDate')
            print(user_id, start_date, end_date)

            if not all([user_id, start_date, end_date]):
                return jsonify({"error": "Missing required parameters"}), 400

            conn = get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            try:
                print(f"fetching entries between {start_date} and {end_date} for user {user_id}")
                cur.execute("""
                    SELECT entries.*, user_moods.color AS mood_color, moods.name AS mood_name
                    FROM entries
                    LEFT JOIN user_moods ON entries.user_mood_id = user_moods.id
                    LEFT JOIN moods ON user_moods.mood_id = moods.id
                    WHERE entries.user_id = %s 
                    AND entries.date >= %s
                    AND entries.date <= %s
                    ORDER BY entries.id
                """, (user_id, start_date, end_date))
            
                entries = cur.fetchall()

                print(entries)
                return jsonify(entries)

            finally:
                cur.close()
                release_connection(conn)

        elif request.method == 'POST':
            data = request.json
            if not data:
                return jsonify({"error": "No JSON data received"}), 400

            required_fields = ['user_id', 'date', 'user_mood_id', 'title', 'entry_text']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields"}), 400

            conn = get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            print(f"adding entry for user {data['user_id']} on {data['date']}")
            try:
                image_path = None
                if 'image' in request.files:
                    file = request.files['image']
                    if file and allowed_file(file.filename):
                        filename = secure_filename(file.filename)
                        unique_filename = f"{uuid.uuid4()}_{filename}"
                        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                        file.save(file_path)
                        image_path = f"/static/uploads/{unique_filename}"
                new_entry_id = f'{data["user_id"]}_{data["date"]}'

                cur.execute("""
                    INSERT INTO entries (id, user_id, date, user_mood_id, title, image_path, entry_text)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE
                    SET user_mood_id = EXCLUDED.user_mood_id,
                        title = EXCLUDED.title,
                        image_path = EXCLUDED.image_path,
                        entry_text = EXCLUDED.entry_text
                    RETURNING id
                    """, 
                    (
                        new_entry_id,
                        data['user_id'],
                        data['date'],
                        data['user_mood_id'],
                        data['title'],
                        image_path,
                        data['entry_text']
                    ))
                new_entry_id = cur.fetchone()['id']

                conn.commit()
                return jsonify({"entry_id": new_entry_id})

            finally:
                cur.close()
                release_connection(conn)

    except Exception as e:
        app.logger.error(f"Error in entries endpoint: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/moods', methods=['POST'])
def moods():
    data = request.json

    # Validate required fields
    required_fields = ['name', 'user_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    mood_name = data['name']
    user_id = data['user_id']
    color = data.get('color')  # Haven't decided if colors are locked in when decided or not. This is here until I decide.

    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Check if mood exists
        cur.execute("SELECT id, name FROM moods WHERE name = %s", (mood_name,))
        existing_mood = cur.fetchone()
        
        if existing_mood:
            mood_id = existing_mood['id']
            is_new = False
        else:
            # Create new mood
            cur.execute("INSERT INTO moods (name) VALUES (%s) RETURNING id", (mood_name,))
            mood_id = cur.fetchone()['id']
            is_new = True

        # Handle user_mood
        user_mood_id = None
        if color:
            cur.execute("""
                INSERT INTO user_moods (user_id, mood_id, color)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, mood_id) DO UPDATE SET color = EXCLUDED.color
                RETURNING id
            """, (user_id, mood_id, color))
            user_mood_id = cur.fetchone()['id']

        conn.commit()
        return jsonify({
            "id": mood_id,
            "name": mood_name,
            "isNew": is_new,
            "color": color,
            "user_mood_id": user_mood_id
        }), 201 if is_new else 200

    except Exception as e:
        conn.rollback()
        print(f"Error in moods endpoint: {str(e)}")
        return jsonify({"error": f"Failed to manage mood: {str(e)}"}), 500
    finally:
        cur.close()
        release_connection(conn)

@app.route('/api/user_moods', methods=['POST'])
def user_moods():
    data = request.json

    # Validate required fields
    required_fields = ['user_id', 'mood_id', 'color']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Insert or update the user_mood
        cur.execute("""
            INSERT INTO user_moods (user_id, mood_id, color)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, mood_id) DO UPDATE SET color = EXCLUDED.color
            RETURNING id
        """, (data['user_id'], data['mood_id'], data['color']))
        user_mood_id = cur.fetchone()['id']

        conn.commit()
        return jsonify({"user_mood_id": user_mood_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        release_connection(conn)

@app.route('/api/notes', methods=['POST'])
def notes():
    
    if request.method == 'POST':
        data = request.json

        # Validate required fields
        required_fields = ['entry_id', 'user_id','date', 'text']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        try:
            print("made it to the try block")
            # Insert the note
            cur.execute("INSERT INTO notes (entry_id, user_id, date, text) VALUES (%s, %s, %s, %s) RETURNING id", (
                data['entry_id'],
                data['user_id'],
                data['date'],
                data['text']
            ))
            new_note_id = cur.fetchone()['id']

            conn.commit()
            return jsonify({"note_id": new_note_id})
        except Exception as e:
            conn.rollback()
            print(f"Error in notes endpoint: {str(e)}")
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            release_connection(conn)
@app.route('/api/notes/<entry_id>', methods=['GET'])
def get_notes_by_entry_id(entry_id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT id, entry_id, user_id, date, text
            FROM notes
            WHERE entry_id = %s
            ORDER BY date DESC
        """, (entry_id,))
        
        notes = cur.fetchall()
        
        return jsonify(notes)
    except Exception as e:
        print(f"Error in get_notes_by_entry_id endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        release_connection(conn)

if __name__ == '__main__':
    app.run(debug=True)