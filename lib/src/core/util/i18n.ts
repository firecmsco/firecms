import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "../../locales/en/translation.json";
import ptBRTranslation from "../../locales/ptBR/translation.json";

const resources = {
    en: {
        translation: enTranslation,
    },
    ptBR: {
        translation: ptBRTranslation,
    },
};

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;
