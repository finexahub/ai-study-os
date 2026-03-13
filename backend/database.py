import sqlite3
import os

# The SQLite database file will be created in the backend folder
DB_FILE = "study_os.db"

def get_connection():
    """Establishes and returns a connection to the SQLite database."""
    return sqlite3.connect(DB_FILE)

def init_db():
    """Creates the necessary tables if they don't exist yet."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS quiz_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT NOT NULL,
                score INTEGER NOT NULL,
                total INTEGER NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

def save_score(topic: str, score: int, total: int):
    """Inserts a new quiz result into the database."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO quiz_scores (topic, score, total) VALUES (?, ?, ?)",
            (topic, score, total)
        )
        conn.commit()

def get_weak_topics():
    """
    Analyzes all scores and returns a list of topics where the 
    student's historical average is below 70%.
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        # Calculate the historical average percentage for each topic
        cursor.execute('''
            SELECT topic, 
                   CAST(SUM(score) AS FLOAT) / SUM(total) as avg_score
            FROM quiz_scores
            GROUP BY topic
            HAVING avg_score < 0.70
            ORDER BY avg_score ASC
            LIMIT 5
        ''')
        results = cursor.fetchall()
        
        # Extract just the topic names from the result tuples
        return [row[0] for row in results]
