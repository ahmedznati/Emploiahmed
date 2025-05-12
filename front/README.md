
# Military School Timetable Application

A comprehensive scheduling application for military schools with both React frontend and Python/SQLite backend.

## Project Structure

The project consists of two main parts:
1. **Frontend**: React application with TypeScript using Tailwind CSS
2. **Backend**: Python Flask application with SQLite database

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Set up a Python virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```
   python app.py
   ```
   The server will start at http://localhost:5000

### Frontend Setup

1. From the project root directory, install dependencies:
   ```
   npm install
   ```

2. Run the frontend development server:
   ```
   npm run dev
   ```
   The application will be available at http://localhost:8080 (or similar)

## Features

- Create and manage teacher profiles with subject expertise and availability
- Manage classes and their subject requirements
- Automatically generate timetables based on teacher availability
- Schedule exams in appropriate time slots
- Admin panel for data management
- Public view for students and staff to check schedules
- Bilingual support (English/French)
- PDF export of timetables

## Default Admin Login

- Password: admin123

## License

This project is proprietary and confidential.
