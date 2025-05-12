
import { ScheduleEntry, Teacher } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DAYS_OF_WEEK, formatTimeSlot, TIME_SLOTS } from './scheduleUtils';

export const DAY_LABELS = {
  en: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
  },
  fr: {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
  },
  ar: {
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
  }
};

export const DAY_LABELS_FR = DAY_LABELS.fr;

interface GeneratePDFParams {
  schedule: ScheduleEntry[];
  teachers: Teacher[];
  selectedClass: string;
  selectedWeek: number;
  getTeacherName: (teacherId: string) => string;
  language?: 'en' | 'fr' | 'ar';
}

export const generateTimetablePDF = ({
  schedule,
  teachers,
  selectedClass,
  selectedWeek,
  getTeacherName,
  language = 'en'
}: GeneratePDFParams) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  
  // Set appropriate title based on language
  let title = "";
  switch (language) {
    case 'fr':
      title = `Emploi du temps pour ${selectedClass} - Semaine ${selectedWeek}`;
      break;
    case 'ar':
      title = `الجدول الزمني للفصل ${selectedClass} - الأسبوع ${selectedWeek}`;
      doc.setR2L(true); // Right-to-left for Arabic
      break;
    case 'en':
    default:
      title = `Timetable for ${selectedClass} - Week ${selectedWeek}`;
      break;
  }
  
  doc.text(title, 14, 15);
  
  const currentDayLabels = DAY_LABELS[language];
  const dayLabels = DAYS_OF_WEEK.map(day => currentDayLabels[day as keyof typeof currentDayLabels]);
  
  // Table headers for each language
  let timeHeader;
  switch (language) {
    case 'fr':
      timeHeader = 'Heure';
      break;
    case 'ar':
      timeHeader = 'الوقت';
      break;
    case 'en':
    default:
      timeHeader = 'Time';
      break;
  }
  
  const tableHeaders = [timeHeader, ...dayLabels];
  
  const getScheduleEntry = (day: string, timeSlot: string): ScheduleEntry | undefined => {
    return schedule.find(entry => 
      entry.day === day && 
      entry.startTime === timeSlot
    );
  };
  
  const tableRows = TIME_SLOTS.slice(0, -1).map((timeSlot, index) => {
    const nextTimeSlot = TIME_SLOTS[index + 1];
    const timeRange = formatTimeSlot(timeSlot, nextTimeSlot);
    
    const rowData = [timeRange];
    
    for (const day of DAYS_OF_WEEK) {
      const entry = getScheduleEntry(day, timeSlot);
      if (entry) {
        const teacher = getTeacherName(entry.teacherId);
        let examText;
        switch (language) {
          case 'fr':
            examText = '(EXAMEN)';
            break;
          case 'ar':
            examText = '(امتحان)';
            break;
          case 'en':
          default:
            examText = '(EXAM)';
            break;
        }
        rowData.push(`${entry.subject}\n${teacher}${entry.isExam ? `\n${examText}` : ''}`);
      } else {
        rowData.push('');
      }
    }
    
    return rowData;
  });
  
  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    theme: 'grid'
  });
  
  // Filename based on language
  let filename;
  switch (language) {
    case 'fr':
      filename = `${selectedClass}-Semaine${selectedWeek}-EmploiDuTemps.pdf`;
      break;
    case 'ar':
      filename = `${selectedClass}-الأسبوع${selectedWeek}-الجدول.pdf`;
      break;
    case 'en':
    default:
      filename = `${selectedClass}-Week${selectedWeek}-Timetable.pdf`;
      break;
  }
  
  doc.save(filename);
};
