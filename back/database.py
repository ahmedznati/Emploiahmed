
import sqlite3
import os
from config import config

def get_db_connection():
    """Create a connection to the SQLite database"""
    conn = sqlite3.connect(config.db_path)
    conn.row_factory = dict_factory
    return conn

def dict_factory(cursor, row):
    """Convert SQLite row to dictionary for JSON response"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def init_db():
    """Initialize the SQLite database with required tables"""
    conn = sqlite3.connect(config.db_path)
    cursor = conn.cursor()
    
    # Create teachers table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subjects TEXT NOT NULL,
        availability TEXT NOT NULL
    )
    ''')
    
    # Create classes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
    )
    ''')
    
    # Create class_subject_requirements table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS class_subject_requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        hours_per_week INTEGER NOT NULL,
        FOREIGN KEY (class_id) REFERENCES classes (id)
    )
    ''')
    
    # Create schedule table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS schedule (
        id TEXT PRIMARY KEY,
        day TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        class_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        is_exam BOOLEAN DEFAULT 0,
        week INTEGER,
        FOREIGN KEY (teacher_id) REFERENCES teachers (id)
    )
    ''')
    
    conn.commit()
    conn.close()
