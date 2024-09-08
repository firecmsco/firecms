import { EnumValues } from "@firecms/core";

export const locales: EnumValues = {
    "de-DE": "German",
    "en-US": "English (US)",
    "es-ES": "Spanish (ES)",
    "es-419": "Spanish (LATAM)",
    "fr-FR": "French",
    "it-IT": "Italian"
};

export const getIso2FromLocale = (locale: string) => {
    return locale.split("-")[0];
}

export const getExtendedCountryNameFromLocale   = (locale: string) => {

    return locales[locale];
}
