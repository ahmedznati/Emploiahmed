
export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  availability: WeeklyAvailability;
}

export interface Class {
  id: string;
  name: string;
  subjectRequirements: SubjectRequirement[];
}

export interface SubjectRequirement {
  subject: string;
  hoursPerWeek: number;
}

export interface WeeklyAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface ScheduleEntry {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string;
  endTime: string;
  teacherId: string;
  className: string;
  subject: string;
  isExam?: boolean;
  week?: number;
}

export interface ScheduleSettings {
  startDate: string;
  numberOfWeeks: number;
  examSchedulingEnabled: boolean;
}

export type UserRole = 'admin' | 'public';

export interface AppState {
  teachers: Teacher[];
  classes: Class[];
  schedule: ScheduleEntry[];
  isAuthenticated: boolean;
  currentRole: UserRole;
  scheduleSettings: ScheduleSettings;
  language: 'en' | 'ar' | 'fr';
}

// Default class names
export const DEFAULT_CLASS_NAMES = ['TA', 'EM', 'GI', 'GC', 'TEL'];
