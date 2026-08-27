import React, { PropsWithChildren, useContext, useEffect, useMemo, useRef } from "react";
import i18next, { i18n } from "i18next";
import { I18nContext, I18nextProvider, initReactI18next } from "react-i18next";
import { en } from "../locales/en";
import { es } from "../locales/es";
import { FireCMSTranslations } from "../types/translations";

const FIRECMS_NS = "firecms_core";

/**
 * Translations that are not part of the bundle every app downloads.
 *
 * All eight locales used to be imported statically, which put ~305KB of strings
 * — every language, for every user — into `@firecms/core` and therefore onto the
 * startup path of every FireCMS app. Only the active language is ever read.
 *
 * `en` and `es` stay static: `en` is the fallback language and the base every
 * unknown locale is seeded from, and both are re-exported from the package root,
 * so a consumer may be importing them by name.
 *
 * The specifiers are written out rather than built from a template so bundlers
 * can see them and emit one chunk per locale.
 */
const localeLoaders: Record<string, () => Promise<FireCMSTranslations>> = {
    de: () => import("../locales/de").then((m) => m.de),
    fr: () => import("../locales/fr").then((m) => m.fr),
    it: () => import("../locales/it").then((m) => m.it),
    hi: () => import("../locales/hi").then((m) => m.hi),
    pt: () => import("../locales/pt").then((m) => m.pt),
    pl: () => import("../locales/pl").then((m) => m.pl)
};

/**
 * Locale bundles available synchronously: the two static ones plus anything a
 * previous provider already fetched. `buildResources` reads this, so a rebuild
 * triggered by a changing `translations` prop cannot overwrite a lazily loaded
 * language with the English base it would otherwise fall back to.
 */
const loadedLocales: Record<string, FireCMSTranslations> = {
    en,
    es
};

const inFlightLocales: Record<string, Promise<void>> = {};

/**
 * Fetch a locale bundle into `loadedLocales`.
 *
 * Returns undefined when the bundle is already in memory or there is nothing to
 * fetch, so callers can stay synchronous in the common case.
 */
function loadLocale(locale?: string): Promise<void> | undefined {
    if (!locale) return undefined;
    const language = locale.split("-")[0];
    if (loadedLocales[language]) return undefined;
    const loader = localeLoaders[language];
    if (!loader) return undefined;
    if (!inFlightLocales[language]) {
        inFlightLocales[language] = loader()
            .then((bundle) => {
                loadedLocales[language] = bundle;
            })
            .catch(() => {
                // A locale that fails to load falls back to English, which is
                // what an unknown locale has always done.
            })
            .finally(() => {
                delete inFlightLocales[language];
            });
    }
    return inFlightLocales[language];
}

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
        const resources = buildResourcesWithParent(translations, parentInstance);

        let initialLocale = parentInstance?.language ?? locale;
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(FIRECMS_LOCALE_STORAGE_KEY);
            if (stored) initialLocale = stored;
        }

        // Kicked off before init so the request is in flight while i18next sets
        // itself up, rather than after it.
        const pendingInitialLocale = loadLocale(initialLocale);

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
                react: {
                    // Locale bundles now arrive after init, and a bundle landing
                    // in the store raises an `added` event rather than
                    // `languageChanged`. react-i18next binds only the latter by
                    // default, so without this a language switched from the
                    // toggle would fetch its strings, put them in the store, and
                    // leave the UI sitting on the English fallback.
                    bindI18nStore: "added"
                },
            }, () => {
                if (!pendingInitialLocale) {
                    setReady(true);
                    return;
                }
                // Holding the first render until the active language has arrived
                // keeps a non-English user from seeing English strings repaint.
                // Only locales outside the static pair wait, and only on the
                // first mount.
                pendingInitialLocale.then(() => {
                    applyLoadedLocale(instance, initialLocale, translations, parentInstance);
                    setReady(true);
                });
            });

        instance.on("languageChanged", (lng) => {
            if (typeof window !== "undefined") {
                localStorage.setItem(FIRECMS_LOCALE_STORAGE_KEY, lng);
            }
            // Switching to a language whose bundle has not been fetched yet
            // renders the English fallback until it lands.
            loadLocale(lng)?.then(() => applyLoadedLocale(instance, lng, translations, parentInstance));
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

    // When consumer translations prop changes, update the resource bundles.
    //
    // Built through the same layering as the initial instance, parent included.
    // Rebuilding from the bare English baseline here would overwrite whatever the
    // host registered — a nested provider without translations of its own would
    // reset the host's overrides to the built-in strings. That was already true;
    // it was simply invisible until `bindI18nStore` made a store write repaint.
    useEffect(() => {
        if (!i18nRef.current) return;
        const resources = buildResourcesWithParent(translations, parentInstance);
        for (const [lang, bundle] of Object.entries(resources)) {
            i18nRef.current.addResourceBundle(
                lang,
                FIRECMS_NS,
                bundle[FIRECMS_NS],
                true,  // deep merge
                true   // overwrite existing keys
            );
        }
    }, [translations, parentInstance]);

    if (!ready || !i18nRef.current) return null;

    return (
        <I18nextProvider i18n={i18nRef.current}>
            {children}
        </I18nextProvider>
    );
}

/**
 * Push a lazily loaded locale bundle into a live i18next instance.
 *
 * Consumer overrides are re-applied on top, because the instance may already be
 * holding a bundle that `buildResources` seeded from English for this language,
 * and the real translations have to win over that seed while the overrides win
 * over both.
 */
function applyLoadedLocale(
    instance: i18n,
    locale: string,
    translations?: { [locale: string]: DeepPartial<FireCMSTranslations> },
    parentInstance?: i18n
) {
    const language = locale.split("-")[0];
    if (!loadedLocales[language]) return;
    const bundle = buildResourcesWithParent(translations, parentInstance)[language]?.[FIRECMS_NS];
    if (!bundle) return;
    instance.addResourceBundle(
        language,
        FIRECMS_NS,
        bundle,
        true,  // deep merge
        true   // overwrite the English seed
    );
}

/**
 * The full resource map for this provider: the locale bundles currently in
 * memory, then anything the parent provider already resolved, then this
 * provider's own overrides on top.
 *
 * Shared by every path that writes into the instance — initial construction, a
 * changed `translations` prop, and a locale arriving late — so all three layer
 * in the same order and none of them can undo another.
 */
function buildResourcesWithParent(
    translations?: { [locale: string]: DeepPartial<FireCMSTranslations> },
    parentInstance?: i18n
): Record<string, Record<string, object>> {
    const resources = buildResources(translations);
    if (!parentInstance) return resources;

    const inherited: Record<string, any> = parentInstance.services?.resourceStore?.data ?? {};
    for (const [lang, namespaces] of Object.entries(inherited)) {
        const bundle = (namespaces as any)?.[FIRECMS_NS];
        if (!bundle) continue;
        resources[lang] = {
            [FIRECMS_NS]: {
                ...(resources[lang]?.[FIRECMS_NS] ?? {}),
                ...bundle,
                ...(translations?.[lang] ?? {})
            }
        };
    }
    return resources;
}

/**
 * Build an i18next resources object from the English baseline plus any
 * consumer-provided overrides.
 */
function buildResources(
    translations?: { [locale: string]: DeepPartial<FireCMSTranslations> }
): Record<string, Record<string, object>> {
    const resources: Record<string, Record<string, object>> = {};
    for (const [lang, bundle] of Object.entries(loadedLocales)) {
        resources[lang] = { [FIRECMS_NS]: { ...bundle } };
    }

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
