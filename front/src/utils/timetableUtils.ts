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
  plannedDate: Date; // <-- Add this prop
}

export const generateTimetablePDF = ({
  schedule,
  teachers,
  selectedClass,
  selectedWeek,
  getTeacherName,
  language = 'en',
  plannedDate // <-- Use this prop
}: GeneratePDFParams) => {
  const doc = new jsPDF();
  
  // Current date (May 16, 2025, 07:50 PM CET)
  const currentDate = new Date('2025-05-16T19:50:00+02:00');
  const formattedDate = currentDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Header
  doc.setFontSize(10);
  doc.text('REPUBLIQUE TUNISIENNE', 14, 20, { align: 'left' });
  doc.text('MINISTERE DE LA DEFENSE', 14, 25, { align: 'left' });
  doc.text('ARMEE DE TERRE', 14, 30, { align: 'left' });
  doc.text('ACADEMIE MILITAIRE', 14, 35, { align: 'left' });

  let emploiHeader = '';
  let emploiHeaderY = 45;
  // Fallback to today if plannedDate is not provided or invalid
  const plannedDateObj = plannedDate instanceof Date && !isNaN(plannedDate.getTime()) ? plannedDate : new Date();
  const plannedDateStr = plannedDateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  switch (language) {
    case 'fr':
      emploiHeader = `EMPLOI DU TEMPS - F-JEID (Prévu le ${plannedDateStr})`;
      break;
    case 'ar':
      emploiHeader = `جدول الحصص - F-JEID (مقرر في ${plannedDateStr})`;
      break;
    case 'en':
    default:
      emploiHeader = `TIMETABLE - F-JEID (Planned for ${plannedDateStr})`;
      break;
  }
  doc.text(emploiHeader, 14, emploiHeaderY, { align: 'left' });

  doc.setFontSize(18);
  doc.setTextColor(41, 128, 185);
  
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
  
  doc.text(title, 105, 60, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
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
      entry.startTime <= timeSlot &&
      entry.endTime > timeSlot
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
  
  // Draw the table and get the Y position after the table
  const autoTableResult = autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 70,
    styles: {
      fontSize: 8, // smaller font
      cellPadding: 2, // smaller padding
      halign: 'center',
      valign: 'middle',
      textColor: [44, 62, 80],
      lineColor: [41, 128, 185],
      lineWidth: 0.2,
      minCellHeight: 6, // reduce min cell height
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontSize: 9, // smaller header font
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    theme: 'grid',
    didDrawCell: (data) => {
      // Highlight exam cells
      if (typeof data.row.index === 'number' && data.cell.raw && String(data.cell.raw).includes('(EXAM')) {
        doc.setTextColor(231, 76, 60);
        doc.setFont(undefined, 'bold');
      } else {
        doc.setTextColor(44, 62, 80);
        doc.setFont(undefined, 'normal');
      }
    }
  });

  // Footer
  doc.setFontSize(10);

  // Place signatures under the timetable using autoTable's finalY
  // jsPDF-AutoTable attaches lastAutoTable to the doc instance
  const footerY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 18 : 200;
  const signatureGapX = 70;

  const signatures = [
    {
      lines: ["Commandant de l'Académie Militaire"],
      x: 14
    },
    {
      lines: ["Commandant de l'Organe", "d'Enseignement et de Formation"],
      x: 14 + signatureGapX
    },
    {
      lines: ["Directeur de l'Enseignement", "Universitaire"],
      x: 14 + signatureGapX * 2
    }
  ];

  signatures.forEach(sig => {
    doc.text(sig.lines, sig.x, footerY, { align: 'left' });
  });

  // Current date for the footer, right-aligned below the last signature
  const today = new Date();
  const todayStr = today.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

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