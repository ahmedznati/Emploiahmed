
from typing import Dict, List, Optional
import json
from .base_model import BaseModel

class TeacherModel(BaseModel):
    """Model for teacher data."""
    
    table_name = "teachers"
    json_fields = ["subjects", "availability"]
    
    def __init__(self, data: Dict = None):
        super().__init__(data)
        
        # Initialize default values if not provided
        if "subjects" not in self.data:
            self.data["subjects"] = []
        if "availability" not in self.data:
            self.data["availability"] = {}
    
    def serialize(self) -> Dict:
        """Convert model data to database format."""
        result = super().serialize()
        
        # Ensure subjects is serialized as JSON
        if "subjects" in result and isinstance(result["subjects"], list):
            result["subjects"] = json.dumps(result["subjects"])
            
        return result
