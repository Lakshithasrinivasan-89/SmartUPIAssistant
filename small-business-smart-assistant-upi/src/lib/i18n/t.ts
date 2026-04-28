import type { SupportedLanguage } from "./translations";
import { TRANSLATIONS } from "./translations";

export function t(lang: SupportedLanguage, key: string) {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}

