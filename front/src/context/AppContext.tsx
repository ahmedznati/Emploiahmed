
import { createContext } from "react";
import { AppState, Teacher, Class, ScheduleSettings } from "../types";

export interface AppContextType {
  state: AppState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  addClass: (cls: Class) => void;
  updateClass: (cls: Class) => void;
  deleteClass: (id: string) => void;
  generateNewSchedule: () => void;
  updateScheduleSettings: (settings: ScheduleSettings) => void;
  toggleLanguage: (lang: 'en' | 'ar' | 'fr') => void;
}

const AppContext = createContext<AppContextType>(undefined!);

export default AppContext;
