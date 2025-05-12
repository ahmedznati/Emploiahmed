
import React, { useState, useRef } from 'react';
import { ScheduleEntry, Teacher } from '@/types';
import { TIME_SLOTS, DAYS_OF_WEEK, formatTimeSlot } from '@/utils/scheduleUtils';
import { generateTimetablePDF } from '@/utils/timetableUtils';
import { TimetableControls } from './timetable/TimetableControls';
import { TimetableHeader } from './timetable/TimetableHeader';
import { ScheduleCell } from './timetable/ScheduleCell';
import { useTranslation } from '@/hooks/useTranslation';
import { useApp } from '@/context/useApp';

interface TimetableProps {
  schedule: ScheduleEntry[];
  teachers: Teacher[];
  classes: { id: string; name: string }[];
}

export function Timetable({ schedule, teachers, classes }: TimetableProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes.length > 0 ? classes[0].name : '');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const timetableRef = useRef<HTMLDivElement>(null);
  const { language } = useApp().state;
  const { t } = useTranslation();
  
  const getAvailableWeeks = (): number[] => {
    const weeks = schedule.map(entry => entry.week).filter(Boolean) as number[];
    return [...new Set(weeks)].sort((a, b) => a - b);
  };
  
  const filteredSchedule = schedule.filter(entry => {
    const classMatch = entry.className === selectedClass;
    const weekMatch = entry.week === selectedWeek;
    return classMatch && weekMatch;
  });
  
  const getTeacherName = (teacherId: string): string => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? t(teacher.name) : t('unknown');
  };
  
  const getScheduleEntry = (day: string, timeSlot: string): ScheduleEntry | undefined => {
    return filteredSchedule.find(entry => 
      entry.day === day && 
      entry.startTime === timeSlot
    );
  };
  
  const downloadAsPDF = () => {
    generateTimetablePDF({
      schedule: filteredSchedule,
      teachers,
      selectedClass,
      selectedWeek,
      getTeacherName,
      language
    });
  };

  const renderTimeSlotCells = (timeSlot: string, index: number) => {
    if (index === TIME_SLOTS.length - 1) return null;
    
    const nextTimeSlot = TIME_SLOTS[index + 1];
    
    return (
      <React.Fragment key={`row-${timeSlot}`}>
        <div className="timetable-time">
          {formatTimeSlot(timeSlot, nextTimeSlot)}
        </div>
        
        {DAYS_OF_WEEK.map(day => (
          <div 
            key={`${day}-${timeSlot}`} 
            className="timetable-cell"
          >
            <ScheduleCell 
              entry={getScheduleEntry(day, timeSlot)}
              getTeacherName={getTeacherName}
            />
          </div>
        ))}
      </React.Fragment>
    );
  };

  const availableWeeks = getAvailableWeeks();

  return (
    <div className="w-full max-w-6xl mx-auto p-4" ref={timetableRef}>
      <TimetableControls
        selectedClass={selectedClass}
        selectedWeek={selectedWeek}
        classes={classes}
        availableWeeks={availableWeeks}
        onClassChange={setSelectedClass}
        onWeekChange={(value) => setSelectedWeek(parseInt(value))}
        onDownloadPDF={downloadAsPDF}
      />
      
      <div className="overflow-x-auto rounded-lg shadow">
        <div className="timetable-grid min-w-[800px]">
          <TimetableHeader />
          {TIME_SLOTS.map((timeSlot, index) => renderTimeSlotCells(timeSlot, index))}
        </div>
      </div>
    </div>
  );
}
