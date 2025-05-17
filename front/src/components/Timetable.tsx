import React, { useState, useRef } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { ScheduleEntry, Teacher } from '@/types';
import { TIME_SLOTS, DAYS_OF_WEEK, formatTimeSlot, isTeacherAvailable, isTeacherBooked } from '@/utils/scheduleUtils';
import { generateTimetablePDF } from '@/utils/timetableUtils';
import { TimetableControls } from './timetable/TimetableControls';
import { TimetableHeader } from './timetable/TimetableHeader';
import { ScheduleCell } from './timetable/ScheduleCell';
import { useTranslation } from '@/hooks/useTranslation';
import { useApp } from '@/context/useApp';
import { useToast } from '@/components/ui/use-toast';

interface TimetableProps {
  schedule: ScheduleEntry[];
  teachers: Teacher[];
  classes: { id: string; name: string }[];
}

export function Timetable({ schedule, teachers, classes }: TimetableProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes.length > 0 ? classes[0].name : '');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const timetableRef = useRef<HTMLDivElement>(null);
  const { state, setSchedule } = useApp();
  const language = state.language;
  const { t } = useTranslation();
  const { toast } = useToast();
  
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

  const getCellId = (day: string, timeSlot: string) => `${day}-${timeSlot}`;

  const getEntryById = (id: string) => filteredSchedule.find(e => e.id === id);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id === over.id) return;
    const draggedEntry = getEntryById(active.id);
    if (!draggedEntry) return;
    const [targetDay, targetTime] = over.id.split('-');
    const targetOccupied = !!getScheduleEntry(targetDay, targetTime);
    if (targetOccupied) return;

    // Constraint checks
    const teacher = teachers.find(t => t.id === draggedEntry.teacherId);
    if (!teacher) return;
    const endTimeIdx = TIME_SLOTS.indexOf(targetTime) + (TIME_SLOTS.indexOf(draggedEntry.endTime) - TIME_SLOTS.indexOf(draggedEntry.startTime));
    const newEndTime = TIME_SLOTS[endTimeIdx];
    if (!newEndTime) return;

    // 1. Teacher availability
    if (!isTeacherAvailable(teacher, targetDay, targetTime, newEndTime)) {
      toast({
        title: t('Teacher is not available at this time.'),
        variant: 'destructive',
      });
      return;
    }
    // 2. Teacher not double-booked
    if (isTeacherBooked(teacher.id, schedule, targetDay, targetTime, newEndTime, draggedEntry.week || selectedWeek)) {
      toast({
        title: t('Teacher is already booked at this time.'),
        variant: 'destructive',
      });
      return;
    }
    // 3. No overlap for this class
    const classOverlap = schedule.some(e =>
      e.id !== draggedEntry.id &&
      e.className === draggedEntry.className &&
      e.day === targetDay &&
      e.week === (draggedEntry.week || selectedWeek) &&
      ((e.startTime < newEndTime && e.endTime > targetTime) ||
       (e.startTime >= targetTime && e.startTime < newEndTime))
    );
    if (classOverlap) {
      toast({
        title: t('Class already has a session at this time.'),
        variant: 'destructive',
      });
      return;
    }

    // Passed all constraints, update entry
    const updatedEntry = { ...draggedEntry, day: targetDay, startTime: targetTime, endTime: newEndTime };
    const newSchedule = schedule.map(e => e.id === draggedEntry.id ? updatedEntry : e);
    setSchedule(newSchedule);
  };
  
  const downloadAsPDF = () => {
    const plannedDate = state.scheduleSettings && state.scheduleSettings.startDate
      ? new Date(state.scheduleSettings.startDate)
      : new Date();
    generateTimetablePDF({
      schedule: filteredSchedule,
      teachers,
      selectedClass,
      selectedWeek,
      getTeacherName,
      language: 'fr', // Force French for PDF
      plannedDate
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
        
        {DAYS_OF_WEEK.map(day => {
          const entry = getScheduleEntry(day, timeSlot);
          const cellId = getCellId(day, timeSlot);
          return (
            <DroppableCell key={cellId} id={cellId}>
              {entry && (
                <DraggableScheduleCell
                  entry={entry}
                  getTeacherName={getTeacherName}
                />
              )}
            </DroppableCell>
          );
        })}
      </React.Fragment>
    );
  };

  const DroppableCell = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
      <div ref={setNodeRef} className="timetable-cell min-h-[60px]">
        {children}
      </div>
    );
  };

  const DraggableScheduleCell = ({ entry, getTeacherName }: { entry: ScheduleEntry; getTeacherName: (id: string) => string }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: entry.id });
    return (
      <div ref={setNodeRef} {...listeners} {...attributes} style={{ cursor: 'grab' }}>
        <ScheduleCell entry={entry} getTeacherName={getTeacherName} />
      </div>
    );
  };

  const availableWeeks = getAvailableWeeks();

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
    </DndContext>
  );
}
