
export interface TranslationItem {
  en: string;
  ar: string;
  fr: string;
}

export interface Translation {
  [key: string]: TranslationItem;
}
