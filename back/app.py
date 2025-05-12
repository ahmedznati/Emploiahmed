
from flask import Flask
from flask_cors import CORS

# Import routes from separate modules
from routes.teachers import teachers_bp
from routes.classes import classes_bp
from routes.schedule import schedule_bp
from database import init_db
from config import config

def create_app():
    app = Flask(__name__)
    CORS(app)  # Allow cross-origin requests from the React frontend
    
    # Initialize database
    init_db()
    
    # Register blueprints for different routes
    app.register_blueprint(teachers_bp, url_prefix='/api')
    app.register_blueprint(classes_bp, url_prefix='/api')
    app.register_blueprint(schedule_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=config.debug)
