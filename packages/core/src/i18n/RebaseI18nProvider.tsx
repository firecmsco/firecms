import React, { PropsWithChildren, useEffect, useRef } from "react";
import i18next, { i18n } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { en } from "../locales/en";
import { es } from "../locales/es";
import { de } from "../locales/de";
import { fr } from "../locales/fr";
import { it } from "../locales/it";
import { hi } from "../locales/hi";
import { pt } from "../locales/pt";
import { RebaseTranslations } from "@rebasepro/types";

const REBASE_NS = "rebase_core";

export const REBASE_LOCALE_STORAGE_KEY = "rebase_locale";

/** DeepPartial helper — allows partial overrides at any nesting level */
type DeepPartial<T> = T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export interface RebaseI18nProviderProps {
    /** BCP-47 locale tag, e.g. "en", "es", "fr". Defaults to "en". */
    locale?: string;
    /**
     * Override or extend any FireCMS UI string, keyed by locale.
     *
     * @example
     * translations={{
     *   en: { save: "Publish" },
     *   es: { save: "Publicar", discard: "Descartar" }
     * }}
     */
    translations?: {
        [locale: string]: DeepPartial<RebaseTranslations>;
    };
}

/**
 * Initialises a dedicated i18next instance for FireCMS's internal UI strings.
 *
 * This instance is isolated from any app-level i18next configuration the
 * consumer may have. Mount this at the top of the FireCMS component tree.
 *
 * @internal
 */
export function RebaseI18nProvider({
    locale = "en",
    translations,
    children
}: PropsWithChildren<RebaseI18nProviderProps>) {
    const i18nRef = useRef<i18n | null>(null);
    const [ready, setReady] = React.useState(false);

    if (!i18nRef.current) {
        const instance = i18next.createInstance();

        // Build the initial resources: English baseline + any consumer overrides
        const resources = buildResources(translations);

        let initialLocale = locale;
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(REBASE_LOCALE_STORAGE_KEY);
            if (stored) initialLocale = stored;
        }

        instance
            .use(initReactI18next)
            .init({
                lng: initialLocale,
                fallbackLng: "en",
                ns: [REBASE_NS],
                defaultNS: REBASE_NS,
                resources,
                interpolation: {
                    // React already escapes — don't double-escape
                    escapeValue: false,
                },
            }, () => {
                setReady(true);
            });

        instance.on("languageChanged", (lng) => {
            if (typeof window !== "undefined") {
                localStorage.setItem(REBASE_LOCALE_STORAGE_KEY, lng);
            }
        });

        i18nRef.current = instance;
    }

    // When `locale` prop changes, switch language on the existing instance
    // ONLY if the user hasn't explicitly set a preference
    useEffect(() => {
        if (i18nRef.current && i18nRef.current.language !== locale) {
            const hasUserPreference = typeof window !== "undefined" && Boolean(localStorage.getItem(REBASE_LOCALE_STORAGE_KEY));
            if (!hasUserPreference) {
                i18nRef.current.changeLanguage(locale);
            }
        }
    }, [locale]);

    // When consumer translations prop changes, update the resource bundles
    useEffect(() => {
        if (!i18nRef.current) return;
        const resources = buildResources(translations);
        for (const [lang, bundle] of Object.entries(resources)) {
            i18nRef.current.addResourceBundle(
                lang,
                REBASE_NS,
                bundle[REBASE_NS],
                true,  // deep merge
                true   // overwrite existing keys
            );
        }
    }, [translations]);

    if (!ready || !i18nRef.current) return null;

    return (
        <I18nextProvider i18n={i18nRef.current}>
            {children}
        </I18nextProvider>
    );
}

/**
 * Build an i18next resources object from the English baseline plus any
 * consumer-provided overrides.
 */
function buildResources(
    translations?: { [locale: string]: DeepPartial<RebaseTranslations> }
): Record<string, Record<string, object>> {
    const resources: Record<string, Record<string, object>> = {
        en: { [REBASE_NS]: { ...en } },
        es: { [REBASE_NS]: { ...es } },
        de: { [REBASE_NS]: { ...de } },
        fr: { [REBASE_NS]: { ...fr } },
        it: { [REBASE_NS]: { ...it } },
        hi: { [REBASE_NS]: { ...hi } },
        pt: { [REBASE_NS]: { ...pt } },
    };

    if (!translations) return resources;

    for (const [lang, overrides] of Object.entries(translations)) {
        if (!resources[lang]) {
            // For non-English/Spanish locales, start from English as the fallback base
            resources[lang] = { [REBASE_NS]: { ...en } };
        }
        // Merge consumer overrides (shallow merge is enough since translations
        // is a flat record — deepMerge option in addResourceBundle handles deeper)
        resources[lang][REBASE_NS] = {
            ...resources[lang][REBASE_NS],
            ...overrides,
        };
    }

    return resources;
}
