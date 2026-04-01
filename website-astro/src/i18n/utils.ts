import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function getUnlocalizedPath(url: URL) {
  const [, lang, ...rest] = url.pathname.split('/');
  if (lang in ui) {
    return '/' + rest.join('/');
  }
  return url.pathname;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui['en']) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    return l === defaultLang ? path : `/${l}${path}`
  }
}
