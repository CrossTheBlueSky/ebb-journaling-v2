from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import uuid
from flask_cors import CORS
from config import DB_CONFIG, DB_SECRET_KEY
from contextlib import contextmanager
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_CONFIG["user"]}:{DB_CONFIG["password"]}@{DB_CONFIG["host"]}:{DB_CONFIG["port"]}/{DB_CONFIG["dbname"]}'
app.config['JWT_SECRET_KEY'] = DB_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Set token expiration
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit


# Initialize extensions
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"], 
                                 "supports_credentials": True, 
                                 "allow_headers": ["Authorization", "Content-Type"]}})

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Constants
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Database connection pool
connection_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn=20,
    dsn=f"dbname={DB_CONFIG['dbname']} host={DB_CONFIG['host']} port={DB_CONFIG['port']} user={DB_CONFIG['user']} password={DB_CONFIG['password']}",
)

# Helper functions
@contextmanager
def get_connection():
    conn = connection_pool.getconn()
    try:
        yield conn
    finally:
        connection_pool.putconn(conn)

def release_connection(conn):
    connection_pool.putconn(conn)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_valid_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify(error="Bad Request"), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify(error="Unauthorized"), 401

@app.errorhandler(404)
def not_found(error):
    return jsonify(error="Not Found"), 404

@app.errorhandler(500)
def server_error(error):
    app.logger.error(f"Server error: {str(error)}")
    return jsonify(error="Internal Server Error"), 500

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        username = request.json.get('username')
        password = request.json.get('password')

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters long"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO users (username, password)
                    VALUES (%s, %s)
                    """, (username, hashed_password))
                conn.commit()
        
        return jsonify({"message": "User created successfully"}), 201

    except psycopg2.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409
    except Exception as e:
        app.logger.error(f"Error in register endpoint: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM users WHERE username = %s", (username,))
                user = cur.fetchone()
        
        if not user or not bcrypt.check_password_hash(user['password'], password):
            return jsonify({"error": "Invalid username or password"}), 401
        
        access_token = create_access_token(identity=user['id'])
        return jsonify(access_token=access_token), 200

    except Exception as e:
        app.logger.error(f"Error in login endpoint: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    try:
        current_user = get_jwt_identity()

        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT username FROM users WHERE id = %s", (current_user,))
                user = cur.fetchone()

        if user:
            return jsonify({
                "username": user['username'],
                "user_id": current_user
            }), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        app.logger.error(f"Error in protected endpoint: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/entries', methods=['GET', 'POST'])
@jwt_required()
def entries():
    current_user = get_jwt_identity()

    if request.method == 'GET':
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        user_id = request.args.get('userId')

        if not all([start_date, end_date]):
            return jsonify({"error": "Missing required parameters"}), 400

        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
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
            
            return jsonify(entries)

        except Exception as e:
            app.logger.error(f"Error fetching entries: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    elif request.method == 'POST':
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        required_fields = ['date', 'user_mood_id', 'title', 'entry_text']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

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

            new_entry_id = f'{current_user}_{data["date"]}'

            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
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
                        (new_entry_id, current_user, data['date'], data['user_mood_id'], data['title'], image_path, data['entry_text']))
                    new_entry_id = cur.fetchone()['id']
                    conn.commit()

            return jsonify({"entry_id": new_entry_id})

        except Exception as e:
            app.logger.error(f"Error creating/updating entry: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/moods', methods=['POST'])
@jwt_required()
def moods():
    current_user = get_jwt_identity()
    data = request.json

    required_fields = ['name']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    mood_name = data['name']
    color = data.get('color')

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT id, name FROM moods WHERE name = %s", (mood_name,))
                existing_mood = cur.fetchone()
                
                if existing_mood:
                    mood_id = existing_mood['id']
                    is_new = False
                else:
                    cur.execute("INSERT INTO moods (name) VALUES (%s) RETURNING id", (mood_name,))
                    mood_id = cur.fetchone()['id']
                    is_new = True

                user_mood_id = None
                if color:
                    cur.execute("""
                        INSERT INTO user_moods (user_id, mood_id, color)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (user_id, mood_id) DO UPDATE SET color = EXCLUDED.color
                        RETURNING id
                    """, (current_user, mood_id, color))
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
        app.logger.error(f"Error managing mood: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/user_moods', methods=['POST'])
@jwt_required()
def user_moods():
    current_user = get_jwt_identity()
    data = request.json

    required_fields = ['mood_id', 'color']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO user_moods (user_id, mood_id, color)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id, mood_id) DO UPDATE SET color = EXCLUDED.color
                    RETURNING id
                """, (current_user, data['mood_id'], data['color']))
                user_mood_id = cur.fetchone()['id']
                conn.commit()

        return jsonify({"user_mood_id": user_mood_id})
    except Exception as e:
        app.logger.error(f"Error managing user mood: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/notes', methods=['POST'])
@jwt_required()
def create_note():
    current_user = get_jwt_identity()
    data = request.json

    required_fields = ['entry_id', 'date', 'text']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("INSERT INTO notes (entry_id, user_id, date, text) VALUES (%s, %s, %s, %s) RETURNING id", (
                    data['entry_id'],
                    current_user,
                    data['date'],
                    data['text']
                ))
                new_note_id = cur.fetchone()['id']
                conn.commit()

        return jsonify({"note_id": new_note_id})
    except Exception as e:
        app.logger.error(f"Error creating note: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/notes/<entry_id>', methods=['GET'])
@jwt_required()
def get_notes_by_entry_id(entry_id):
    current_user = get_jwt_identity()

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, entry_id, user_id, date, text
                    FROM notes
                    WHERE entry_id = %s AND user_id = %s
                    ORDER BY date DESC
                """, (entry_id, current_user))
                notes = cur.fetchall()
        
        return jsonify(notes)
    except Exception as e:
        app.logger.error(f"Error fetching notes: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/users', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_user():
    current_user = get_jwt_identity()

    if request.method == 'GET':
        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT id, username FROM users WHERE id = %s", (current_user,))
                    user = cur.fetchone()
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            return jsonify(user)
        except Exception as e:
            app.logger.error(f"Error fetching user: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    elif request.method == 'PUT':
        data = request.json
        if 'username' not in data and 'password' not in data:
            return jsonify({"error": "No fields to update"}), 400

        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    if 'username' in data:
                        cur.execute("UPDATE users SET username = %s WHERE id = %s", (data['username'], current_user))
                    if 'password' in data:
                        if len(data['password']) < 8:
                            return jsonify({"error": "Password must be at least 8 characters long"}), 400
                        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
                        cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, current_user))
                    conn.commit()
            return jsonify({"message": "User updated successfully"})
        except Exception as e:
            app.logger.error(f"Error updating user: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    elif request.method == 'DELETE':
            try:
                with get_connection() as conn:
                    with conn.cursor(cursor_factory=RealDictCursor) as cur:
                        cur.execute("DELETE FROM users WHERE id = %s", (current_user,))
                        conn.commit()
                        return jsonify({"message": "User deleted successfully"})
            except Exception as e:
                app.logger.error(f"Error deleting user: {str(e)}")
                return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/entries/<entry_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_entry(entry_id):
    current_user = get_jwt_identity()

    if not is_valid_uuid(entry_id):
        return jsonify({"error": "Invalid entry ID"}), 400

    if request.method == 'GET':
        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT entries.*, user_moods.color AS mood_color, moods.name AS mood_name
                        FROM entries
                        LEFT JOIN user_moods ON entries.user_mood_id = user_moods.id
                        LEFT JOIN moods ON user_moods.mood_id = moods.id
                        WHERE entries.id = %s AND entries.user_id = %s
                    """, (entry_id, current_user))
                    entry = cur.fetchone()
            
            if not entry:
                return jsonify({"error": "Entry not found"}), 404
            
            return jsonify(entry)
        except Exception as e:
            app.logger.error(f"Error fetching entry: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    elif request.method == 'PUT':
        data = request.json
        required_fields = ['date', 'user_mood_id', 'title', 'entry_text']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

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

            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        UPDATE entries
                        SET date = %s, user_mood_id = %s, title = %s, entry_text = %s, image_path = COALESCE(%s, image_path)
                        WHERE id = %s AND user_id = %s
                        RETURNING id
                    """, (data['date'], data['user_mood_id'], data['title'], data['entry_text'], image_path, entry_id, current_user))
                    updated_entry = cur.fetchone()
                    conn.commit()

            if not updated_entry:
                return jsonify({"error": "Entry not found or you don't have permission to update it"}), 404

            return jsonify({"message": "Entry updated successfully", "entry_id": updated_entry['id']})
        except Exception as e:
            app.logger.error(f"Error updating entry: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    elif request.method == 'DELETE':
        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("DELETE FROM entries WHERE id = %s AND user_id = %s RETURNING id", (entry_id, current_user))
                    deleted_entry = cur.fetchone()
                    conn.commit()

            if not deleted_entry:
                return jsonify({"error": "Entry not found or you don't have permission to delete it"}), 404

            return jsonify({"message": "Entry deleted successfully"})
        except Exception as e:
            app.logger.error(f"Error deleting entry: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/notes/<note_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_note(note_id):
    current_user = get_jwt_identity()

    if not note_id.isdigit():
        return jsonify({"error": "Invalid note ID"}), 400

    if request.method == 'GET':
        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM notes WHERE id = %s AND user_id = %s", (note_id, current_user))
                    note = cur.fetchone()
            
            if not note:
                return jsonify({"error": "Note not found"}), 404
            
            return jsonify(note)
        except Exception as e:
            app.logger.error(f"Error fetching note: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    elif request.method == 'PUT':
        data = request.json
        if 'text' not in data:
            return jsonify({"error": "Missing required field: text"}), 400

        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        UPDATE notes
                        SET text = %s, date = CURRENT_TIMESTAMP
                        WHERE id = %s AND user_id = %s
                        RETURNING id
                    """, (data['text'], note_id, current_user))
                    updated_note = cur.fetchone()
                    conn.commit()

            if not updated_note:
                return jsonify({"error": "Note not found or you don't have permission to update it"}), 404

            return jsonify({"message": "Note updated successfully", "note_id": updated_note['id']})
        except Exception as e:
            app.logger.error(f"Error updating note: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

    elif request.method == 'DELETE':
        try:
            with get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("DELETE FROM notes WHERE id = %s AND user_id = %s RETURNING id", (note_id, current_user))
                    deleted_note = cur.fetchone()
                    conn.commit()

            if not deleted_note:
                return jsonify({"error": "Note not found or you don't have permission to delete it"}), 404

            return jsonify({"message": "Note deleted successfully"})
        except Exception as e:
            app.logger.error(f"Error deleting note: {str(e)}")
            return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/chart-data/', methods=['GET', 'OPTIONS'])
@jwt_required()
def chart_data():
    current_user = get_jwt_identity()
    
    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT entries.date, moods.name AS mood_name,
                        user_moods.color AS mood_color,
                    COUNT(*) AS entry_count
                    FROM entries
                    JOIN user_moods ON entries.user_mood_id = user_moods.id
                    JOIN moods ON user_moods.mood_id = moods.id
                    WHERE entries.user_id = %s
                    GROUP BY entries.date, moods.name, user_moods.color
                    ORDER BY entries.date ASC
                    """, (current_user,))
                chart_data = cur.fetchall()
        
        return jsonify(chart_data)
    except Exception as e:
        app.logger.error(f"Error fetching chart data: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True)