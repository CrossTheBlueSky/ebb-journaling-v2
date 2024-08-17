import psycopg2
from config import DB_CONFIG

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def check_tables_exist():
    conn = get_db_connection()
    cur = conn.cursor()
    
    tables = ['users', 'user_moods', 'entries', 'notes']
    
    for table in tables:
        cur.execute(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}')")
        exists = cur.fetchone()[0]
        print(f"{table.capitalize()} table exists: {exists}")
    
    cur.close()
    conn.close()

check_tables_exist()