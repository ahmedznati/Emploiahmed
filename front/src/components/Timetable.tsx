import React, { useState, useRef } from 'react';
import { ScheduleEntry, Teacher } from '@/types';
import { TIME_SLOTS, DAYS_OF_WEEK, formatTimeSlot } from '@/utils/scheduleUtils';
import { generateTimetablePDF } from '@/utils/timetableUtils';
import { TimetableControls } from './timetable/TimetableControls';
import { TimetableHeader } from './timetable/TimetableHeader';
import { ScheduleCell } from './timetable/ScheduleCell';
import { useTranslation } from '@/hooks/useTranslation';
import { useApp } from '@/context/useApp';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { isTeacherAvailable, isTeacherBooked } from '@/utils/availabilityUtils';
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
  const { state } = useApp();
  const language = state.language;
  const { t } = useTranslation();
  const [localSchedule, setLocalSchedule] = useState<ScheduleEntry[]>(schedule);
  const { toast } = useToast();

  const getAvailableWeeks = (): number[] => {
    const weeks = schedule.map(entry => entry.week).filter(Boolean) as number[];
    return [...new Set(weeks)].sort((a, b) => a - b);
  };
  
  const filteredSchedule = localSchedule.filter(entry => {
    const classMatch = entry.className === selectedClass;
    const weekMatch = entry.week === selectedWeek;
    return classMatch && weekMatch;
  });
  
  const getTeacherName = (teacherId: string): string => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? t(teacher.name) : t('unknown');
  };
  
  const getScheduleEntry = (day: string, timeSlot: string): ScheduleEntry | undefined => {
    // Only show the entry if this slot is the start of the session (for exams)
    return filteredSchedule.find(entry =>
      entry.day === day &&
      entry.startTime === timeSlot
    );
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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    // Find the entry being dragged
    const entry = localSchedule.find(e => e.id === draggableId);
    if (!entry || entry.isExam) return; // Only allow non-exam sessions
    // Parse destination droppableId: format is 'cell-day-timeSlot'
    const [_, destDay, destTimeSlot] = destination.droppableId.split('-');
    // Prevent dropping into an exam slot
    const destEntry = filteredSchedule.find(e => e.day === destDay && e.startTime === destTimeSlot);
    if (destEntry && destEntry.isExam) {
      toast({
        title: 'Déplacement impossible',
        description: 'Impossible de déplacer une session dans une case d\'examen.',
        variant: 'destructive'
      });
      return;
    }
    // Check if slot is free (no session or exam)
    const slotOccupied = localSchedule.some(e =>
      e.day === destDay &&
      e.startTime === destTimeSlot &&
      e.week === entry.week &&
      e.className === entry.className
    );
    if (slotOccupied) {
      toast({
        title: 'Déplacement impossible',
        description: 'Cette case est déjà occupée par une autre session.',
        variant: 'destructive'
      });
      return;
    }
    // Calculate new endTime based on session duration
    const startIdx = TIME_SLOTS.indexOf(destTimeSlot);
    const endIdx = startIdx + (TIME_SLOTS.indexOf(entry.endTime) - TIME_SLOTS.indexOf(entry.startTime));
    const newEndTime = TIME_SLOTS[endIdx] || entry.endTime;
    // Check teacher availability
    const teacher = teachers.find(t => t.id === entry.teacherId);
    if (!teacher || !isTeacherAvailable(teacher, destDay, destTimeSlot, newEndTime)) {
      toast({
        title: 'Déplacement impossible',
        description: 'L\'enseignant n\'est pas disponible à ce créneau.',
        variant: 'destructive'
      });
      return;
    }
    if (isTeacherBooked(entry.teacherId, localSchedule, destDay, destTimeSlot, newEndTime, entry.week!)) {
      toast({
        title: 'Déplacement impossible',
        description: 'L\'enseignant est déjà occupé à ce créneau.',
        variant: 'destructive'
      });
      return;
    }
    // Update entry
    setLocalSchedule(prev => prev.map(e =>
      e.id === entry.id
        ? { ...e, day: destDay as ScheduleEntry['day'], startTime: destTimeSlot, endTime: newEndTime }
        : e
    ));
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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="overflow-x-auto rounded-lg shadow">
          <div className="timetable-grid min-w-[800px]">
            <TimetableHeader />
            {TIME_SLOTS.slice(0, -1).map((timeSlot, rowIdx) => (
              <React.Fragment key={`row-${timeSlot}`}> 
                <div className="timetable-time">{formatTimeSlot(timeSlot, TIME_SLOTS[rowIdx + 1])}</div>
                {DAYS_OF_WEEK.map((day, colIdx) => {
                  // Find any entry (including exams) covering this slot
                  const entry = filteredSchedule.find(e =>
                    e.day === day &&
                    e.startTime <= timeSlot &&
                    e.endTime > timeSlot &&
                    e.isExam
                  ) || getScheduleEntry(day, timeSlot);
                  const cellId = `cell-${day}-${timeSlot}`;
                  return (
                    <Droppable droppableId={cellId} key={cellId} direction="vertical">
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="timetable-cell">
                          {entry ? (
                            entry.isExam ? (
                              <ScheduleCell entry={entry} getTeacherName={getTeacherName} />
                            ) : (
                              <Draggable draggableId={entry.id} index={0}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="timetable-cell"
                                  >
                                    <ScheduleCell entry={entry} getTeacherName={getTeacherName} />
                                  </div>
                                )}
                              </Draggable>
                            )
                          ) : null}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
