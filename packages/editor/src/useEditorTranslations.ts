import { useEffect } from "react";
import { useTranslation } from "@firecms/core";
import { editorTranslationsEn } from "./locales/en";
import { editorTranslationsEs } from "./locales/es";
import { editorTranslationsDe } from "./locales/de";
import { editorTranslationsFr } from "./locales/fr";
import { editorTranslationsIt } from "./locales/it";
import { editorTranslationsHi } from "./locales/hi";
import { editorTranslationsPt } from "./locales/pt";

const FIRECMS_NS = "firecms_core";

const editorLocales: Record<string, object> = {
    en: editorTranslationsEn,
    es: editorTranslationsEs,
    de: editorTranslationsDe,
    fr: editorTranslationsFr,
    it: editorTranslationsIt,
    hi: editorTranslationsHi,
    pt: editorTranslationsPt,
};

let registered = false;

/**
 * Registers editor translations into the FireCMS i18next instance.
 * Safe to call multiple times — registrations are idempotent.
 * @internal
 */
export function useEditorTranslations() {
    const { i18n } = useTranslation();

    useEffect(() => {
        if (!i18n || registered) return;
        for (const [locale, translations] of Object.entries(editorLocales)) {
            i18n.addResourceBundle(locale, FIRECMS_NS, translations, true, true);
        }
        registered = true;
    }, [i18n]);
}
