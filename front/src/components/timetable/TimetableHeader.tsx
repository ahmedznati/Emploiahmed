
import { DAYS_OF_WEEK } from '@/utils/scheduleUtils';
import { useTranslation } from '@/hooks/useTranslation';

export const TimetableHeader = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <div className="timetable-header">
        {t("hour")}
      </div>
      {DAYS_OF_WEEK.map(day => (
        <div key={day} className="timetable-header">
          {t(day)}
        </div>
      ))}
    </>
  );
};
