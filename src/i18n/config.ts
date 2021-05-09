
import i18n, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Locale } from '../CMSAppProps';
import enGb from "./enGB.json";
import pt from "./pt.json";

const supportedLngs : Locale[] = [
  "enGB",
  "pt"
];

const resources : Resource = {
  "enGB": { translation: enGb },
  "pt":{ translation:  pt },
};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: "enGB",
    supportedLngs: supportedLngs,
    defaultNS: 'translation',
    fallbackNS: 'translation',
    resources,
  });