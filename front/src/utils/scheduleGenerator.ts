import { Teacher, Class, ScheduleEntry, ScheduleSettings } from "../types";
import { DAYS_OF_WEEK, TIME_SLOTS } from "./timeConstants";
import { isTeacherAvailable, isTeacherBooked } from "./availabilityUtils";

export function generateSchedule(
  teachers: Teacher[], 
  classes: Class[],
  settings: ScheduleSettings
): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  let scheduleId = 1;
  
  // First, create a distribution plan for all classes and subjects
  const classDistributionPlans = createDistributionPlans(classes, settings.numberOfWeeks);
  
  // For each week, distribute the hours evenly
  for (let week = 1; week <= settings.numberOfWeeks; week++) {
    // For better distribution, process days in a rotating order
    const rotatedDays = [...DAYS_OF_WEEK];
    // Rotate days starting position for each week to distribute classes more evenly
    if (week > 1) {
      const rotationFactor = (week - 1) % DAYS_OF_WEEK.length;
      for (let i = 0; i < rotationFactor; i++) {
        const day = rotatedDays.shift();
        if (day) rotatedDays.push(day);
      }
    }
    
    // Process classes in different order for each week
    const shuffledClasses = [...classes].sort((a, b) => 
      ((a.name.charCodeAt(0) + week) % 26) - ((b.name.charCodeAt(0) + week) % 26)
    );
    
    // Assign sessions for each class
    for (const cls of shuffledClasses) {
      // Get the distribution plan for this class
      const distributionPlan = classDistributionPlans[cls.id];
      if (!distributionPlan) continue;
      
      // Process each subject requirement
      for (const req of cls.subjectRequirements) {
        // Get hours planned for this week
        const weekPlan = distributionPlan[req.subject];
        if (!weekPlan || !weekPlan[week]) continue;
        
        const hoursForThisWeek = weekPlan[week];
        let hoursAssigned = 0;
        
        // Find eligible teachers for this subject
        const eligibleTeachers = teachers.filter(t => 
          t.subjects.includes(req.subject)
        );
        
        if (eligibleTeachers.length === 0) {
          console.warn(`No teachers available for ${req.subject} in class ${cls.name}`);
          continue;
        }
        
        // Track hours per subject per day for this class
        const subjectHoursPerDay: Record<string, Record<string, number>> = {};
        for (const day of DAYS_OF_WEEK) {
          if (!subjectHoursPerDay[day]) subjectHoursPerDay[day] = {};
          subjectHoursPerDay[day][req.subject] = 0;
        }
        let hoursLeft = hoursForThisWeek;
        let dayIndex = 0;
        // Partition hours: try to assign 3, then 3, then 2, then 1, etc. (max 3 per day, always consecutive)
        const dailyHourChunks: number[] = [];
        let remaining = hoursLeft;
        while (remaining > 0) {
          if (remaining >= 3) {
            dailyHourChunks.push(3);
            remaining -= 3;
          } else {
            dailyHourChunks.push(remaining);
            remaining = 0;
          }
        }
        let chunkIdx = 0;
        while (chunkIdx < dailyHourChunks.length && dayIndex < DAYS_OF_WEEK.length) {
          const day = DAYS_OF_WEEK[dayIndex];
          const assignable = dailyHourChunks[chunkIdx];
          // Find consecutive available slots for 'assignable' hours
          let assignedThisDay = 0;
          let found = false;
          for (let timeIndex = 0; timeIndex <= TIME_SLOTS.length - assignable; timeIndex++) {
            // Check if all slots are free and consecutive
            let canAssign = true;
            for (let c = 0; c < assignable; c++) {
              const startTime = TIME_SLOTS[timeIndex + c];
              const endTime = TIME_SLOTS[timeIndex + c + 1];
              const classHasSessionAtThisTime = schedule.some(entry =>
                entry.className === cls.name &&
                entry.day === day &&
                entry.startTime === startTime &&
                entry.week === week
              );
              if (classHasSessionAtThisTime) {
                canAssign = false;
                break;
              }
            }
            if (canAssign) {
              // Assign all consecutive slots
              for (let c = 0; c < assignable; c++) {
                const startTime = TIME_SLOTS[timeIndex + c];
                const endTime = TIME_SLOTS[timeIndex + c + 1];
                const availableTeachers = eligibleTeachers.filter(teacher =>
                  isTeacherAvailable(teacher, day, startTime, endTime) &&
                  !isTeacherBooked(teacher.id, schedule, day, startTime, endTime, week)
                );
                if (availableTeachers.length > 0) {
                  const teacherLoads = availableTeachers.map(teacher => ({
                    teacher,
                    load: schedule.filter(entry =>
                      entry.teacherId === teacher.id &&
                      entry.week === week
                    ).length
                  }));
                  teacherLoads.sort((a, b) => a.load - b.load);
                  const selectedTeacher = teacherLoads[0].teacher;
                  schedule.push({
                    id: `schedule-${scheduleId++}`,
                    day: day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday",
                    startTime,
                    endTime,
                    teacherId: selectedTeacher.id,
                    className: cls.name,
                    subject: req.subject,
                    week
                  });
                  hoursAssigned++;
                  assignedThisDay++;
                  subjectHoursPerDay[day][req.subject]++;
                  hoursLeft--;
                }
              }
              found = true;
              break;
            }
          }
          if (found) {
            chunkIdx++;
            dayIndex++;
          } else {
            // If couldn't assign this chunk to this day, try next day
            dayIndex++;
            if (dayIndex >= DAYS_OF_WEEK.length) {
              // If we reach the end of the week, start again from the first day
              dayIndex = 0;
            }
          }
        }
        
        // If we couldn't assign all hours, log a warning
        if (hoursAssigned < hoursForThisWeek) {
          console.warn(`Could only assign ${hoursAssigned}/${hoursForThisWeek} hours for ${req.subject} in class ${cls.name} for week ${week}`);
        }
      }
    }
  }
  
  // Schedule exams if enabled
  if (settings.examSchedulingEnabled) {
    scheduleExams(schedule, teachers, classes, settings.numberOfWeeks, scheduleId);
  }
  
  return schedule;
}

function createDistributionPlans(classes: Class[], numberOfWeeks: number) {
  const plans: Record<string, Record<string, Record<number, number>>> = {};
  
  classes.forEach(cls => {
    plans[cls.id] = {};
    
    cls.subjectRequirements.forEach(req => {
      plans[cls.id][req.subject] = {};
      
      // Calculate base hours per week and remainder
      const baseHoursPerWeek = Math.floor(req.hoursPerWeek / numberOfWeeks);
      let remainingHours = req.hoursPerWeek % numberOfWeeks;
      
      // Distribute base hours to all weeks
      for (let week = 1; week <= numberOfWeeks; week++) {
        plans[cls.id][req.subject][week] = baseHoursPerWeek;
      }
      
      // Distribute remaining hours starting from first week
      let week = 1;
      while (remainingHours > 0) {
        plans[cls.id][req.subject][week]++;
        remainingHours--;
        week++;
        if (week > numberOfWeeks) week = 1;
      }
    });
  });
  
  return plans;
}

function scheduleExams(
  schedule: ScheduleEntry[], 
  teachers: Teacher[], 
  classes: Class[], 
  lastWeek: number,
  startId: number
) {
  let examId = startId;
  
  // Preferred days for exams, in order
  const preferredExamDays = ['thursday', 'friday', 'wednesday', 'tuesday', 'monday', 'saturday'];
  
  classes.forEach(cls => {
    // Group subjects for the same class to schedule exams on different days if possible
    const subjectsToSchedule = cls.subjectRequirements.map(req => req.subject);
    
    // For each subject, try to schedule an exam
    subjectsToSchedule.forEach(subject => {
      // First check if any class has been scheduled for this subject
      const hasSessionsForSubject = schedule.some(entry => 
        entry.className === cls.name && 
        entry.subject === subject
      );
      
      if (!hasSessionsForSubject) return; // Skip if no sessions were scheduled for this subject
      
      // Find eligible teachers
      const eligibleTeachers = teachers.filter(t => t.subjects.includes(subject));
      if (eligibleTeachers.length === 0) return;
      
      // Try to schedule on preferred days
      let examScheduled = false;
      
      for (const day of preferredExamDays) {
        if (examScheduled) break;
        
        // Try to schedule a 2-hour exam (spanning two time slots)
        for (let timeIndex = 0; timeIndex < TIME_SLOTS.length - 2; timeIndex++) {
          if (examScheduled) break;
          
          const startTime = TIME_SLOTS[timeIndex];
          const endTimeIndex = timeIndex + 2;
          if (endTimeIndex >= TIME_SLOTS.length) continue;
          
          const endTime = TIME_SLOTS[endTimeIndex];
          
          // Check if class already has an exam or class at this time
          const classHasSessionAtThisTime = schedule.some(entry => 
            entry.className === cls.name &&
            entry.day === day &&
            entry.week === lastWeek &&
            (
              (entry.startTime <= startTime && entry.endTime > startTime) ||
              (entry.startTime < endTime && entry.endTime >= endTime) ||
              (entry.startTime >= startTime && entry.endTime <= endTime)
            )
          );
          
          if (classHasSessionAtThisTime) continue;
          
          // Find available teachers
          const availableTeachers = eligibleTeachers.filter(teacher => 
            isTeacherAvailable(teacher, day, startTime, endTime) && 
            !isTeacherBooked(teacher.id, schedule, day, startTime, endTime, lastWeek)
          );
          
          if (availableTeachers.length > 0) {
            // Find the teacher with the most balanced workload
            const teacherLoads = availableTeachers.map(teacher => ({
              teacher,
              load: schedule.filter(entry => 
                entry.teacherId === teacher.id && 
                entry.week === lastWeek &&
                entry.isExam
              ).length
            }));
            
            // Sort by workload (ascending)
            teacherLoads.sort((a, b) => a.load - b.load);
            
            // Select the teacher with the lowest exam workload
            const selectedTeacher = teacherLoads[0].teacher;
            
            schedule.push({
              id: `exam-${examId++}`,
              day: day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday",
              startTime,
              endTime,
              teacherId: selectedTeacher.id,
              className: cls.name,
              subject: `${subject} Exam`,
              isExam: true,
              week: lastWeek
            });
            
            examScheduled = true;
            break;
          }
        }
      }
      
      if (!examScheduled) {
        console.warn(`Could not schedule exam for ${subject} in class ${cls.name}`);
      }
    });
  });
}
