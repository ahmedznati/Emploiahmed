
// Export all utility functions in an organized manner
// Avoid duplicate exports by explicitly naming what to export
export { 
  TIME_SLOTS, 
  DAYS_OF_WEEK, 
  DAY_LABELS, 
  DAY_LABELS_FR, 
  formatTimeSlot 
} from './timeConstants';

export { 
  createEmptyTimeSlots,
  isTeacherAvailable,
  isTeacherBooked 
} from './availabilityUtils';

export { 
  generateSchedule 
} from './scheduleGenerator';
