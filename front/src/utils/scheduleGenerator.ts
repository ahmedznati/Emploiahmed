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

      for (const req of cls.subjectRequirements) {
        const weekPlan = distributionPlan[req.subject];
        if (!weekPlan || !weekPlan[week]) continue;

        const hoursForThisWeek = weekPlan[week];
        let hoursAssigned = 0;
        // Only use the assigned teacher if teacherId is set
        let eligibleTeachers: Teacher[];
        if (req.teacherId) {
          const assignedTeacher = teachers.find(t => t.id === req.teacherId);
          eligibleTeachers = assignedTeacher ? [assignedTeacher] : [];
        } else {
          eligibleTeachers = teachers.filter(t =>
            t.subjects.includes(req.subject)
          );
        }

        if (eligibleTeachers.length === 0) {
          console.warn(`No teachers available for ${req.subject} in class ${cls.name}`);
          continue;
        }

        const subjectHoursPerDay: Record<string, Record<string, number>> = {};
        for (const day of DAYS_OF_WEEK) {
          subjectHoursPerDay[day] = { [req.subject]: 0 };
        }

        let hoursLeft = hoursForThisWeek;
        let dayIndex = 0;

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
          let found = false;

          for (let timeIndex = 0; timeIndex <= TIME_SLOTS.length - assignable; timeIndex++) {
            let canAssign = true;

            for (let c = 0; c < assignable; c++) {
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

            if (canAssign) {
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
                      entry.teacherId === teacher.id && entry.week === week
                    ).length
                  }));
                  teacherLoads.sort((a, b) => a.load - b.load);
                  const selectedTeacher = teacherLoads[0].teacher;

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
            dayIndex++;
            if (dayIndex >= DAYS_OF_WEEK.length) {
              dayIndex = 0;
            }
          }
        }

        if (hoursAssigned < hoursForThisWeek) {
          console.warn(`Could only assign ${hoursAssigned}/${hoursForThisWeek} hours for ${req.subject} in class ${cls.name} for week ${week}`);
        }
      }
    }
  }

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

function scheduleExams(
  schedule: ScheduleEntry[],
  teachers: Teacher[],
  classes: Class[],
  lastWeek: number,
  startId: number
) {
  let examId = startId;
  const preferredExamDays = ['thursday', 'friday', 'wednesday', 'tuesday', 'monday', 'saturday'];

  classes.forEach(cls => {
    const subjects = cls.subjectRequirements.map(req => req.subject);

    subjects.forEach(subject => {
      const hasSessions = schedule.some(entry =>
        entry.className === cls.name &&
        entry.subject === subject
      );
      if (!hasSessions) return;

      const eligibleTeachers = teachers.filter(t => t.subjects.includes(subject));
      if (eligibleTeachers.length === 0) return;

      let examScheduled = false;

      // Use the assigned teacher for this subject if available
      const subjectReq = cls.subjectRequirements.find(req => req.subject === subject);
      let assignedTeacherId = subjectReq?.teacherId;
      let examTeacher: Teacher | undefined = undefined;
      if (assignedTeacherId) {
        examTeacher = teachers.find(t => t.id === assignedTeacherId);
      }

      for (const day of preferredExamDays) {
        if (examScheduled) break;

        for (let timeIndex = 0; timeIndex < TIME_SLOTS.length - 2; timeIndex++) {
          const startTime = TIME_SLOTS[timeIndex];
          const endTime = TIME_SLOTS[timeIndex + 2];

          const conflict = schedule.some(entry =>
            entry.className === cls.name &&
            entry.day === day &&
            entry.week === lastWeek &&
            (
              (entry.startTime <= startTime && entry.endTime > startTime) ||
              (entry.startTime < endTime && entry.endTime >= endTime) ||
              (entry.startTime >= startTime && entry.endTime <= endTime)
            )
          );
          if (conflict) continue;

          let availableTeachers: Teacher[] = [];
          if (examTeacher) {
            if (
              isTeacherAvailable(examTeacher, day, startTime, endTime) &&
              !isTeacherBooked(examTeacher.id, schedule, day, startTime, endTime, lastWeek)
            ) {
              availableTeachers = [examTeacher];
            }
          } else {
            availableTeachers = eligibleTeachers.filter(teacher =>
              isTeacherAvailable(teacher, day, startTime, endTime) &&
              !isTeacherBooked(teacher.id, schedule, day, startTime, endTime, lastWeek)
            );
          }

          if (availableTeachers.length > 0) {
            const teacherLoads = availableTeachers.map(teacher => ({
              teacher,
              load: schedule.filter(entry =>
                entry.teacherId === teacher.id &&
                entry.week === lastWeek &&
                entry.isExam
              ).length
            }));
            teacherLoads.sort((a, b) => a.load - b.load);
            const selectedTeacher = teacherLoads[0].teacher;

            schedule.push({
              id: `exam-${examId++}`,
              day: day as ScheduleEntry["day"],
              startTime,
              endTime,
              teacherId: examTeacher ? examTeacher.id : (selectedTeacher ? selectedTeacher.id : ''), // Use the subject's assigned teacher if available
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
    });
  });
}
