
import { ScheduleEntry } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface ScheduleCellProps {
  entry?: ScheduleEntry;
  getTeacherName: (teacherId: string) => string;
}

export const ScheduleCell = ({ entry, getTeacherName }: ScheduleCellProps) => {
  const { t } = useTranslation();
  
  if (!entry) return null;

  return (
    <div className="class-block p-2 bg-blue-100 border border-blue-300 rounded shadow-sm">
      {entry.isExam && (
        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium float-right">
          {t("exam")}
        </span>
      )}
      
      <p className="font-bold text-blue-900 text-sm mt-1">{t(entry.subject)}</p>
      
      <div className="mt-2 bg-white p-1.5 rounded border border-gray-200">
        <p className="text-sm font-medium text-gray-800">{getTeacherName(entry.teacherId)}</p>
      </div>
    </div>
  );
};
