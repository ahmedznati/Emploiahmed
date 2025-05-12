
import { useApp } from "@/context/useApp";
import { translations } from "@/utils/translations";

export function useTranslation() {
  const { state } = useApp();
  
  const t = (key: string): string => {
    const language = state.language;
    
    // @ts-ignore - Adding dynamic key access
    if (translations[key] && translations[key][language]) {
      // @ts-ignore - Adding dynamic key access
      return translations[key][language];
    }
    
    // Fallback to English if translation is missing
    // @ts-ignore - Adding dynamic key access
    if (translations.en && translations.en[key]) {
      // @ts-ignore - Adding dynamic key access
      return translations.en[key];
    }
    
    // Return the key if no translation is found
    return key;
  };
  
  return { t };
}
