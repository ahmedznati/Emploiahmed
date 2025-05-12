
import os
from enum import Enum

class EnvironmentType(Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"

class Config:
    """Configuration settings for the application."""
    
    def __init__(self):
        self.env = os.environ.get("FLASK_ENV", "development")
        self.debug = self.env != "production"
        self.db_path = os.path.join("db", "school_timetable.db")
        
        # Ensure the database directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
    @property
    def environment(self):
        """Return the current environment type."""
        if self.env == "production":
            return EnvironmentType.PRODUCTION
        elif self.env == "testing":
            return EnvironmentType.TESTING
        else:
            return EnvironmentType.DEVELOPMENT
            
    @property
    def database_uri(self):
        """Return the database URI based on the environment."""
        return f"sqlite:///{self.db_path}"

# Create a singleton config instance
config = Config()
