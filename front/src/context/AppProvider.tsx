
import React, { useState } from "react";
import { AppState, ScheduleSettings } from "../types";
import { generateSchedule } from "../utils/scheduleGenerator";
import { useToast } from "@/components/ui/use-toast";
import AppContext from "./AppContext";
import { useDataLoader } from "../hooks/useDataLoader";
import { useAuth } from "../hooks/useAuth";
import { useTeacherManagement } from "../hooks/useTeacherManagement";
import { useClassManagement } from "../hooks/useClassManagement";

const initialScheduleSettings: ScheduleSettings = {
  startDate: new Date().toISOString().split('T')[0],
  numberOfWeeks: 4,
  examSchedulingEnabled: true
};

const initialState: AppState = {
  teachers: [],
  classes: [],
  schedule: [],
  isAuthenticated: false,
  currentRole: 'public',
  scheduleSettings: initialScheduleSettings,
  language: 'en'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(initialScheduleSettings);
  const [schedule, setSchedule] = useState<AppState["schedule"]>([]);
  const [language, setLanguage] = useState<'en' | 'ar' | 'fr'>('en');
  const { toast } = useToast();

  const { teachers, classes, setTeachers, setClasses } = useDataLoader(initialState);
  const { isAuthenticated, currentRole, login, logout, changePassword } = useAuth();
  const { addTeacher, updateTeacher, deleteTeacher } = useTeacherManagement(teachers, setTeachers);
  const { addClass, updateClass, deleteClass } = useClassManagement(classes, setClasses);

  const updateScheduleSettings = (settings: ScheduleSettings) => {
    setScheduleSettings(settings);
    toast({
      title: "Paramètres de l'emploi du temps mis à jour",
      description: "Les paramètres de génération de l'emploi du temps ont été mis à jour."
    });
  };

  const generateNewSchedule = () => {
    const newSchedule = generateSchedule(teachers, classes, scheduleSettings);
    setSchedule(newSchedule);
    toast({
      title: "Emploi du temps généré",
      description: `Un nouvel emploi du temps a été généré avec ${newSchedule.length} sessions de cours.`
    });
  };

  const toggleLanguage = (lang: 'en' | 'ar' | 'fr') => {
    setLanguage(lang);
    
    const messages = {
      'en': "Language changed to English",
      'ar': "تم تغيير اللغة إلى العربية",
      'fr': "La langue a été changée en français"
    };
    
    toast({
      title: "Language Changed",
      description: messages[lang]
    });
  };

  return (
    <AppContext.Provider value={{
      state: {
        teachers,
        classes,
        schedule,
        isAuthenticated,
        currentRole,
        scheduleSettings,
        language
      },
      login,
      logout,
      changePassword,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      addClass,
      updateClass,
      deleteClass,
      generateNewSchedule,
      updateScheduleSettings,
      toggleLanguage
    }}>
      {children}
    </AppContext.Provider>
  );
};
