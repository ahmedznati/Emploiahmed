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
  const classDistributionPlans = createDistributionPlans(classes, settings.numberOfWeeks);

  // Track last 4-hour day for each subject/class/week
  const lastFourHourDay: Record<string, Record<string, Record<number, string | null>>> = {};
  // Track last session for each subject/class
  const lastSession: Record<string, Record<string, { week: number; day: string; endTime: string }>> = {};

  for (let week = 1; week <= settings.numberOfWeeks; week++) {
    const rotatedDays = [...DAYS_OF_WEEK];
    if (week > 1) {
      const rotationFactor = (week - 1) % DAYS_OF_WEEK.length;
      for (let i = 0; i < rotationFactor; i++) {
        const day = rotatedDays.shift();
        if (day) rotatedDays.push(day);
      }
    }
    const shuffledClasses = [...classes].sort((a, b) =>
      ((a.name.charCodeAt(0) + week) % 26) - ((b.name.charCodeAt(0) + week) % 26)
    );
    for (const cls of shuffledClasses) {
      const distributionPlan = classDistributionPlans[cls.id];
      if (!distributionPlan) continue;
      if (!lastFourHourDay[cls.id]) lastFourHourDay[cls.id] = {};
      if (!lastSession[cls.id]) lastSession[cls.id] = {};
      for (const req of cls.subjectRequirements) {
        const weekPlan = distributionPlan[req.subject];
        if (!weekPlan || !weekPlan[week]) continue;
        if (!lastFourHourDay[cls.id][req.subject]) lastFourHourDay[cls.id][req.subject] = {};
        const hoursForThisWeek = weekPlan[week];
        let hoursAssigned = 0;
        let eligibleTeachers: Teacher[];
        if (req.teacherId) {
          const assignedTeacher = teachers.find(t => t.id === req.teacherId);
          eligibleTeachers = assignedTeacher ? [assignedTeacher] : [];
        } else {
          eligibleTeachers = teachers.filter(t => t.subjects.includes(req.subject));
        }
        if (eligibleTeachers.length === 0) {
          console.warn(`No teachers available for ${req.subject} in class ${cls.name}`);
          continue;
        }
        let hoursLeft = hoursForThisWeek;
        let dayIndex = 0;
        // Try to assign in blocks, max 4 per day, always consecutive
        const assignedDays: string[] = [];
        while (hoursLeft > 0 && dayIndex < DAYS_OF_WEEK.length) {
          const day = DAYS_OF_WEEK[dayIndex];
          // Enforce 1-day gap after a 4-hour block
          const last4hDay = lastFourHourDay[cls.id][req.subject][week];
          if (
            last4hDay &&
            DAYS_OF_WEEK.includes(day) &&
            DAYS_OF_WEEK.includes(last4hDay as typeof DAYS_OF_WEEK[number]) &&
            Math.abs(DAYS_OF_WEEK.indexOf(day as typeof DAYS_OF_WEEK[number]) - DAYS_OF_WEEK.indexOf(last4hDay as typeof DAYS_OF_WEEK[number])) === 1
          ) {
            dayIndex++;
            continue;
          }
          // Find max block (4, 3, 2, 1) that fits and does not exceed 4 per day
          let block = Math.min(4, hoursLeft);
          let found = false;
          while (block > 0 && !found) {
            for (let timeIndex = 0; timeIndex <= TIME_SLOTS.length - block; timeIndex++) {
              // Only allow 4-hour block if all in morning or all in afternoon
              if (block === 4) {
                const morning = TIME_SLOTS.slice(0, 4).map(t => t);
                const afternoon = TIME_SLOTS.slice(-4).map(t => t);
                const blockSlots = TIME_SLOTS.slice(timeIndex, timeIndex + 4);
                const isMorning = blockSlots.every(s => morning.includes(s));
                const isAfternoon = blockSlots.every(s => afternoon.includes(s));
                if (!isMorning && !isAfternoon) continue;
              }
              // Check if block is free for this class
              let canAssign = true;
              for (let c = 0; c < block; c++) {
                const startTime = TIME_SLOTS[timeIndex + c];
                const classHasSession = schedule.some(entry =>
                  entry.className === cls.name &&
                  entry.day === day &&
                  entry.startTime === startTime &&
                  entry.week === week
                );
                if (classHasSession) {
                  canAssign = false;
                  break;
                }
              }
              if (!canAssign) continue;
              // Check teacher availability for the whole block
              let availableTeachers = eligibleTeachers.filter(teacher => {
                for (let c = 0; c < block; c++) {
                  const startTime = TIME_SLOTS[timeIndex + c];
                  const endTime = TIME_SLOTS[timeIndex + c + 1];
                  if (!isTeacherAvailable(teacher, day, startTime, endTime) ||
                    isTeacherBooked(teacher.id, schedule, day, startTime, endTime, week)) {
                    return false;
                  }
                }
                return true;
              });
              if (availableTeachers.length > 0) {
                // Assign to teacher with least load
                const teacherLoads = availableTeachers.map(teacher => ({
                  teacher,
                  load: schedule.filter(entry => entry.teacherId === teacher.id && entry.week === week).length
                }));
                teacherLoads.sort((a, b) => a.load - b.load);
                const selectedTeacher = teacherLoads[0].teacher;
                for (let c = 0; c < block; c++) {
                  const startTime = TIME_SLOTS[timeIndex + c];
                  const endTime = TIME_SLOTS[timeIndex + c + 1];
                  schedule.push({
                    id: `schedule-${scheduleId++}`,
                    day: day as ScheduleEntry["day"],
                    startTime,
                    endTime,
                    teacherId: selectedTeacher.id,
                    className: cls.name,
                    subject: req.subject,
                    week
                  });
                  hoursAssigned++;
                  hoursLeft--;
                  // Track last session for this subject/class
                  lastSession[cls.id][req.subject] = { week, day, endTime };
                }
                assignedDays.push(day);
                if (block === 4) {
                  lastFourHourDay[cls.id][req.subject][week] = day;
                }
                found = true;
                break;
              }
            }
            if (!found) block--;
          }
          dayIndex++;
        }
        if (hoursAssigned < hoursForThisWeek) {
          console.warn(`Could only assign ${hoursAssigned}/${hoursForThisWeek} hours for ${req.subject} in class ${cls.name} for week ${week}`);
        }
        // If this is the last week for this subject, schedule its exam the next day
        const totalWeeks = settings.numberOfWeeks;
        const isLastWeek = week === totalWeeks;
        // Calculate total assigned so far for this subject/class
        let totalAssigned = 0;
        for (let w = 1; w <= totalWeeks; w++) {
          const weekPlan = distributionPlan[req.subject];
          if (weekPlan && weekPlan[w]) {
            // Count how many sessions are scheduled for this subject/class/week
            totalAssigned += schedule.filter(e => e.className === cls.name && e.subject === req.subject && e.week === w).length;
          }
        }
        const totalRequired = Object.values(distributionPlan[req.subject] || {}).reduce((a, b) => a + b, 0);
        if (settings.examSchedulingEnabled && totalAssigned === totalRequired) {
          // Schedule exam the next day after last session
          const last = lastSession[cls.id][req.subject];
          if (last) {
            let examWeek = last.week;
            const lastDay = last.day as typeof DAYS_OF_WEEK[number];
            let examDayIndex = DAYS_OF_WEEK.indexOf(lastDay) + 1;
            if (examDayIndex >= DAYS_OF_WEEK.length) {
              examDayIndex = 0;
              examWeek++;
            }
            let foundExamSlot = false;
            const preferredExamDays = [DAYS_OF_WEEK[examDayIndex], ...DAYS_OF_WEEK.filter((d, i) => i !== examDayIndex)];
            const eligibleTeachers = req.teacherId
              ? teachers.filter(t => t.id === req.teacherId)
              : teachers.filter(t => t.subjects.includes(req.subject));
            let examTeacher: Teacher | undefined = eligibleTeachers[0];
            for (const day of preferredExamDays) {
              if (foundExamSlot) break;
              for (let timeIndex = 0; timeIndex < TIME_SLOTS.length - 2; timeIndex++) {
                const startTime = TIME_SLOTS[timeIndex];
                const endTime = TIME_SLOTS[timeIndex + 2]; // Always 2-hour duration
                // Only allow if both startTime and endTime are valid
                if (!startTime || !endTime) continue;
                // Check for conflicts
                const conflict = schedule.some(entry =>
                  entry.className === cls.name &&
                  entry.day === day &&
                  entry.week === examWeek &&
                  ((entry.startTime <= startTime && entry.endTime > startTime) ||
                    (entry.startTime < endTime && entry.endTime >= endTime) ||
                    (entry.startTime >= startTime && entry.endTime <= endTime))
                );
                if (conflict) continue;
                // Check teacher availability
                let availableTeachers: Teacher[] = eligibleTeachers.filter(teacher =>
                  isTeacherAvailable(teacher, day, startTime, endTime) &&
                  !isTeacherBooked(teacher.id, schedule, day, startTime, endTime, examWeek)
                );
                if (availableTeachers.length > 0) {
                  // Assign to teacher with least exam load
                  const teacherLoads = availableTeachers.map(teacher => ({
                    teacher,
                    load: schedule.filter(entry => entry.teacherId === teacher.id && entry.week === examWeek && entry.isExam).length
                  }));
                  teacherLoads.sort((a, b) => a.load - b.load);
                  const selectedTeacher = teacherLoads[0].teacher;
                  schedule.push({
                    id: `exam-${scheduleId++}`,
                    day: day as ScheduleEntry["day"],
                    startTime,
                    endTime, // Always 2-hour duration
                    teacherId: selectedTeacher.id,
                    className: cls.name,
                    subject: `${req.subject} Exam`,
                    isExam: true,
                    week: examWeek
                  });
                  foundExamSlot = true;
                  break;
                }
              }
            }
            if (!foundExamSlot) {
              console.warn(`Could not schedule exam for ${req.subject} in class ${cls.name}`);
            }
          }
        }
      }
    }
  }
  // Remove old scheduleExams call, as exams are now scheduled inline
  return schedule;
}

function createDistributionPlans(classes: Class[], numberOfWeeks: number) {
  const plans: Record<string, Record<string, Record<number, number>>> = {};

  classes.forEach(cls => {
    plans[cls.id] = {};

    cls.subjectRequirements.forEach(req => {
      plans[cls.id][req.subject] = {};

      const baseHoursPerWeek = Math.floor(req.hoursPerWeek / numberOfWeeks);
      let remainingHours = req.hoursPerWeek % numberOfWeeks;

      for (let week = 1; week <= numberOfWeeks; week++) {
        plans[cls.id][req.subject][week] = baseHoursPerWeek;
      }

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
