import React, { PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react";
import i18next, { i18n } from "i18next";
import { I18nContext, I18nextProvider, initReactI18next } from "react-i18next";
import { en } from "../locales/en";
import { es } from "../locales/es";
import { de } from "../locales/de";
import { fr } from "../locales/fr";
import { it } from "../locales/it";
import { hi } from "../locales/hi";
import { pt } from "../locales/pt";
import { pl } from "../locales/pl";
import { FireCMSTranslations } from "../types/translations";

const FIRECMS_NS = "firecms_core";

export const FIRECMS_LOCALE_STORAGE_KEY = "firecms_locale";

/** DeepPartial helper — allows partial overrides at any nesting level */
type DeepPartial<T> = T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export interface FireCMSi18nProviderProps {
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
        [locale: string]: DeepPartial<FireCMSTranslations>;
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
export function FireCMSi18nProvider({
    locale = "en",
    translations,
    children
}: PropsWithChildren<FireCMSi18nProviderProps>) {

    // A FireCMS i18next instance already in context means this provider is nested —
    // e.g. FireCMSCloudApp mounts one inside the one the host app already mounted.
    // A second instance built only from the defaults would shadow the parent's and
    // silently drop every translation the host registered, leaving the host's own
    // strings to render as raw keys.
    //
    // So the nested instance is *seeded* from the parent's resources rather than
    // sharing them. Sharing one mutable instance was the obvious alternative and is
    // wrong: bundles added by one provider outlive it, so opening one project's app
    // and then switching to another left the first project's translations answering
    // for keys the second never defined. Copying keeps each provider's strings to
    // itself, which is also how this behaved before nesting was handled at all.
    const parentI18n = useContext(I18nContext)?.i18n;
    const parentInstance = parentI18n?.hasResourceBundle?.("en", FIRECMS_NS)
        ? parentI18n
        : undefined;

    const i18nRef = useRef<i18n | null>(null);
    const [ready, setReady] = React.useState(false);

    if (!i18nRef.current) {
        const instance = i18next.createInstance();

        // English baseline + this provider's overrides, with anything the parent
        // already resolved layered in underneath the overrides.
        const resources = buildResources(translations);
        if (parentInstance) {
            const inherited: Record<string, any> = parentInstance.services?.resourceStore?.data ?? {};
            for (const [lang, namespaces] of Object.entries(inherited)) {
                const bundle = (namespaces as any)?.[FIRECMS_NS];
                if (!bundle) continue;
                resources[lang] = {
                    [FIRECMS_NS]: {
                        ...bundle,
                        ...(translations?.[lang] ?? {})
                    }
                };
            }
        }

        let initialLocale = parentInstance?.language ?? locale;
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(FIRECMS_LOCALE_STORAGE_KEY);
            if (stored) initialLocale = stored;
        }

        instance
            .use(initReactI18next)
            .init({
                lng: initialLocale,
                fallbackLng: "en",
                ns: [FIRECMS_NS],
                defaultNS: FIRECMS_NS,
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
                localStorage.setItem(FIRECMS_LOCALE_STORAGE_KEY, lng);
            }
        });

        i18nRef.current = instance;
    }

    // Follow the parent's language, so a switch made outside this provider is not
    // stranded on the other side of the boundary.
    useEffect(() => {
        if (!parentInstance || !i18nRef.current) return;
        const instance = i18nRef.current;
        const follow = (lng: string) => {
            if (instance.language !== lng) instance.changeLanguage(lng);
        };
        parentInstance.on("languageChanged", follow);
        return () => { parentInstance.off("languageChanged", follow); };
    }, [parentInstance]);

    // When `locale` prop changes, switch language on the existing instance
    // ONLY if the user hasn't explicitly set a preference
    useEffect(() => {
        if (i18nRef.current && i18nRef.current.language !== locale) {
            const hasUserPreference = typeof window !== "undefined" && Boolean(localStorage.getItem(FIRECMS_LOCALE_STORAGE_KEY));
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
                FIRECMS_NS,
                bundle[FIRECMS_NS],
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
    translations?: { [locale: string]: DeepPartial<FireCMSTranslations> }
): Record<string, Record<string, object>> {
    const resources: Record<string, Record<string, object>> = {
        en: { [FIRECMS_NS]: { ...en } },
        es: { [FIRECMS_NS]: { ...es } },
        de: { [FIRECMS_NS]: { ...de } },
        fr: { [FIRECMS_NS]: { ...fr } },
        it: { [FIRECMS_NS]: { ...it } },
        hi: { [FIRECMS_NS]: { ...hi } },
        pt: { [FIRECMS_NS]: { ...pt } },
        pl: { [FIRECMS_NS]: { ...pl } },
    };

    if (!translations) return resources;

    for (const [lang, overrides] of Object.entries(translations)) {
        if (!resources[lang]) {
            // For non-English/Spanish locales, start from English as the fallback base
            resources[lang] = { [FIRECMS_NS]: { ...en } };
        }
        // Merge consumer overrides (shallow merge is enough since translations
        // is a flat record — deepMerge option in addResourceBundle handles deeper)
        resources[lang][FIRECMS_NS] = {
            ...resources[lang][FIRECMS_NS],
            ...overrides,
        };
    }

    return resources;
}
