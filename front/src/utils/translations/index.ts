
import { baseTranslations } from "./baseTranslations";
import { adminTranslations } from "./adminTranslations";
import { uiTranslations } from "./uiTranslations";
import { subjectsTranslations } from "./subjectsTranslations";
import { classesTranslations } from "./classesTranslations";
import { formsTranslations } from "./formsTranslations";
import { backendTranslations } from "./backendTranslations";

// Merge all translations into a single object
export const translations = {
  ...baseTranslations,
  ...adminTranslations,
  ...uiTranslations,
  ...subjectsTranslations,
  ...classesTranslations,
  ...formsTranslations,
  ...backendTranslations
};

// Re-export the getTranslation function
export function getTranslation(key: string, language: 'en' | 'ar' | 'fr'): string {
  if (translations[key] && translations[key][language]) {
    return translations[key][language];
  }
  
  // Fallback to English if translation not found
  if (translations[key]) {
    return translations[key].en;
  }
  
  // Return the key if no translation exists
  return key;
}
