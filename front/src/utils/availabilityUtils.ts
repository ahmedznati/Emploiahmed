
import { Teacher, ScheduleEntry, WeeklyAvailability, TimeSlot } from "../types";

export function createEmptyTimeSlots(): WeeklyAvailability {
  const emptyDay: TimeSlot[] = [];
  
  return {
    monday: [...emptyDay],
    tuesday: [...emptyDay],
    wednesday: [...emptyDay],
    thursday: [...emptyDay],
    friday: [...emptyDay],
    saturday: [...emptyDay]
  };
}

export function isTeacherAvailable(
  teacher: Teacher, 
  day: string, 
  startTime: string, 
  endTime: string
): boolean {
  const dayAvailability = teacher.availability[day as keyof WeeklyAvailability] || [];
  
  return dayAvailability.some(slot => 
    slot.start <= startTime && slot.end >= endTime
  );
}

export function isTeacherBooked(
  teacherId: string, 
  schedule: ScheduleEntry[], 
  day: string, 
  startTime: string, 
  endTime: string,
  week: number
): boolean {
  return schedule.some(entry => 
    entry.teacherId === teacherId && 
    entry.day === day &&
    entry.week === week &&
    ((entry.startTime <= startTime && entry.endTime > startTime) || 
     (entry.startTime < endTime && entry.endTime >= endTime) ||
     (entry.startTime >= startTime && entry.endTime <= endTime))
  );
}
