
# Military School Timetable Backend

This is a Python/Flask backend for the Military School Timetable application. It replaces the Supabase backend with a local SQLite database while maintaining all the functionality of the original application.

## Setup Instructions

1. Create a virtual environment (optional but recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server
   ```bash
   python app.py
   ```

The server will start at http://localhost:5000

## API Endpoints

- `/api/teachers` - GET, POST - Get all teachers or add a new teacher
- `/api/teachers/<id>` - PUT, DELETE - Update or delete a teacher
- `/api/classes` - GET, POST - Get all classes or add a new class
- `/api/classes/<id>` - PUT, DELETE - Update or delete a class
- `/api/schedule` - GET, POST - Get the schedule or update the entire schedule

## Database

The application uses SQLite stored in `db/school_timetable.db`. The database is created automatically when the application runs for the first time.
