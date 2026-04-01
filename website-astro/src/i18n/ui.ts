import { en } from './en';
import { es } from './es';
import { de } from './de';
import { fr } from './fr';
import { it } from './it';
import { pt } from './pt';

export const languages = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
};

export const defaultLang = 'en';

export const ui = {
  en,
  es,
  de,
  fr,
  it,
  pt,
} as const;
