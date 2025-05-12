
from typing import Dict, List, Optional
from .base_model import BaseModel
import json

class ScheduleModel(BaseModel):
    """Model for schedule data."""
    
    table_name = "schedule"
    
    def __init__(self, data: Dict = None):
        super().__init__(data)
        
        # Convert boolean field properly if present as an integer
        if "is_exam" in self.data and isinstance(self.data["is_exam"], int):
            self.data["is_exam"] = bool(self.data["is_exam"])
    
    def serialize(self) -> Dict:
        """Convert model data to database format."""
        result = self.data.copy()
        
        # Convert case differences in field names
        if "startTime" in result:
            result["start_time"] = result.pop("startTime")
        if "endTime" in result:
            result["end_time"] = result.pop("endTime")
        if "teacherId" in result:
            result["teacher_id"] = result.pop("teacherId")
        if "className" in result:
            result["class_name"] = result.pop("className")
        if "isExam" in result:
            result["is_exam"] = 1 if result.pop("isExam") else 0
            
        return result
    
    def deserialize(self, db_data: Dict) -> Dict:
        """Convert database data to model format."""
        result = db_data.copy()
        
        # Convert case differences in field names
        if "start_time" in result:
            result["startTime"] = result.pop("start_time")
        if "end_time" in result:
            result["endTime"] = result.pop("end_time")
        if "teacher_id" in result:
            result["teacherId"] = result.pop("teacher_id")
        if "class_name" in result:
            result["className"] = result.pop("class_name")
        if "is_exam" in result:
            result["isExam"] = bool(result.pop("is_exam"))
            
        return result
