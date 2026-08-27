import type { i18n } from "i18next";
import { FireCMSPlugin, PluginTranslations } from "../types";

const FIRECMS_NS = "firecms_core";

/**
 * Record of which bundles have already been written to which locale, so the
 * same one is never written twice.
 *
 * Plugin translation objects are module-level constants and a lazily loaded one
 * resolves to the same module object every time, so identity is a sound test.
 */
export type AppliedBundles = Map<string, Set<object>>;

export function createAppliedBundles(): AppliedBundles {
    return new Map();
}

/**
 * Write the plugins' strings for one language into a live i18next instance.
 *
 * Only the language in use is resolved, plus English, which every other language
 * falls back to — a locale given as a function is a bundle that has not been
 * downloaded yet, and downloading all of them would undo the point of deferring
 * them. Plain records are applied for every locale, as before: they are already
 * in the bundle, so there is nothing to save by holding them back.
 *
 * `applied` is what stops the injection feeding itself. A write raises a store
 * event; the event repaints everything subscribed to this instance, including
 * the component that owns the `plugins` array — the collection editor and SaaS
 * plugin hooks both call `useTranslation` — and that array is an inline literal,
 * so its fresh identity re-runs the effect that called this. react-i18next
 * happens to stop re-rendering after one pass, but that is a bail-out rather
 * than a guarantee, and the redundant writes are worth avoiding regardless.
 *
 * Returns a function that reports whether the caller is still mounted, so a
 * bundle that arrives after unmount is dropped rather than written.
 */
export function applyPluginTranslations({
    i18n,
    plugins,
    language,
    applied,
    isActive = () => true
}: {
    i18n: i18n;
    plugins?: FireCMSPlugin<any, any, any>[];
    language: string;
    applied: AppliedBundles;
    isActive?: () => boolean;
}) {
    const wanted = new Set([language.split("-")[0], "en"]);

    const add = (locale: string, bundle: PluginTranslations) => {
        if (!isActive()) return;
        let written = applied.get(locale);
        if (!written) {
            written = new Set();
            applied.set(locale, written);
        }
        if (written.has(bundle)) return;
        written.add(bundle);
        i18n.addResourceBundle(
            locale,
            FIRECMS_NS,
            bundle,
            true,  // deep merge
            true   // overwrite
        );
    };

    plugins?.forEach((plugin) => {
        if (!plugin.i18n) return;
        Object.entries(plugin.i18n).forEach(([locale, translations]) => {
            if (typeof translations === "function") {
                if (!wanted.has(locale.split("-")[0])) return;
                translations()
                    .then((bundle) => add(locale, bundle))
                    .catch(() => {
                        // A locale that fails to load falls back to English.
                    });
            } else {
                add(locale, translations);
            }
        });
    });
}
