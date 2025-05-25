# Military School Timetable Backend

This backend replaces the previous Python/Flask backend. All endpoints and database logic are now implemented in Node.js/Express with MongoDB (Mongoose).

## Main Files
- `app.js`: Main entry point (replaces `app.py`).
- `config.js`: Configuration (replaces `config.py`).
- `database.js`: MongoDB connection (replaces `database.py`).
- `init_db.js`: Database initializer (replaces `init_db.py`).

## Running the Server

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   node app.js
   ```

## API Endpoints
- `/api/schedule` - Schedule management
- `/api/classes` - Class management
- `/api/teachers` - Teacher management
- `/api/auth` - Authentication
- `/api/subjects` - Subject management

All logic is now in JavaScript/Node.js. No Python/Flask code is used.
