import { useEffect, useReducer } from "react";
import type { Locale as DateFnsLocale } from "date-fns";
import { Locale } from "../types";

/**
 * On-demand loading of date-fns locales.
 *
 * `import * as locales from "date-fns/locale"` pulls in every locale date-fns
 * ships — 625KB of parsed JavaScript, loaded on every single page view, to
 * support a `locale` setting that is unset for almost every project. Worse, it
 * sat on the critical path: `@firecms/core` imported it statically, so the
 * browser could not render anything until it had come down.
 *
 * Each locale now has its own dynamic import, so exactly one small chunk is
 * fetched, and only when a project actually configures a locale. Projects that
 * do not configure one (the default) pay nothing at all.
 *
 * The map is written out rather than built from a template literal because Vite
 * and webpack both need the specifier to be statically analysable to emit the
 * chunks.
 */
const loaders: Partial<Record<Locale, () => Promise<DateFnsLocale>>> = {
    af: () => import("date-fns/locale/af").then(m => m.af),
    ar: () => import("date-fns/locale/ar").then(m => m.ar),
    arDZ: () => import("date-fns/locale/ar-DZ").then(m => m.arDZ),
    arMA: () => import("date-fns/locale/ar-MA").then(m => m.arMA),
    arSA: () => import("date-fns/locale/ar-SA").then(m => m.arSA),
    az: () => import("date-fns/locale/az").then(m => m.az),
    be: () => import("date-fns/locale/be").then(m => m.be),
    bg: () => import("date-fns/locale/bg").then(m => m.bg),
    bn: () => import("date-fns/locale/bn").then(m => m.bn),
    ca: () => import("date-fns/locale/ca").then(m => m.ca),
    cs: () => import("date-fns/locale/cs").then(m => m.cs),
    cy: () => import("date-fns/locale/cy").then(m => m.cy),
    da: () => import("date-fns/locale/da").then(m => m.da),
    de: () => import("date-fns/locale/de").then(m => m.de),
    el: () => import("date-fns/locale/el").then(m => m.el),
    enAU: () => import("date-fns/locale/en-AU").then(m => m.enAU),
    enCA: () => import("date-fns/locale/en-CA").then(m => m.enCA),
    enGB: () => import("date-fns/locale/en-GB").then(m => m.enGB),
    enIN: () => import("date-fns/locale/en-IN").then(m => m.enIN),
    enNZ: () => import("date-fns/locale/en-NZ").then(m => m.enNZ),
    enUS: () => import("date-fns/locale/en-US").then(m => m.enUS),
    eo: () => import("date-fns/locale/eo").then(m => m.eo),
    es: () => import("date-fns/locale/es").then(m => m.es),
    et: () => import("date-fns/locale/et").then(m => m.et),
    eu: () => import("date-fns/locale/eu").then(m => m.eu),
    faIR: () => import("date-fns/locale/fa-IR").then(m => m.faIR),
    fi: () => import("date-fns/locale/fi").then(m => m.fi),
    fr: () => import("date-fns/locale/fr").then(m => m.fr),
    frCA: () => import("date-fns/locale/fr-CA").then(m => m.frCA),
    frCH: () => import("date-fns/locale/fr-CH").then(m => m.frCH),
    gd: () => import("date-fns/locale/gd").then(m => m.gd),
    gl: () => import("date-fns/locale/gl").then(m => m.gl),
    gu: () => import("date-fns/locale/gu").then(m => m.gu),
    he: () => import("date-fns/locale/he").then(m => m.he),
    hi: () => import("date-fns/locale/hi").then(m => m.hi),
    hr: () => import("date-fns/locale/hr").then(m => m.hr),
    hu: () => import("date-fns/locale/hu").then(m => m.hu),
    hy: () => import("date-fns/locale/hy").then(m => m.hy),
    id: () => import("date-fns/locale/id").then(m => m.id),
    is: () => import("date-fns/locale/is").then(m => m.is),
    it: () => import("date-fns/locale/it").then(m => m.it),
    ja: () => import("date-fns/locale/ja").then(m => m.ja),
    ka: () => import("date-fns/locale/ka").then(m => m.ka),
    kk: () => import("date-fns/locale/kk").then(m => m.kk),
    kn: () => import("date-fns/locale/kn").then(m => m.kn),
    ko: () => import("date-fns/locale/ko").then(m => m.ko),
    lb: () => import("date-fns/locale/lb").then(m => m.lb),
    lt: () => import("date-fns/locale/lt").then(m => m.lt),
    lv: () => import("date-fns/locale/lv").then(m => m.lv),
    mk: () => import("date-fns/locale/mk").then(m => m.mk),
    ms: () => import("date-fns/locale/ms").then(m => m.ms),
    mt: () => import("date-fns/locale/mt").then(m => m.mt),
    nb: () => import("date-fns/locale/nb").then(m => m.nb),
    nl: () => import("date-fns/locale/nl").then(m => m.nl),
    nlBE: () => import("date-fns/locale/nl-BE").then(m => m.nlBE),
    nn: () => import("date-fns/locale/nn").then(m => m.nn),
    pl: () => import("date-fns/locale/pl").then(m => m.pl),
    pt: () => import("date-fns/locale/pt").then(m => m.pt),
    ptBR: () => import("date-fns/locale/pt-BR").then(m => m.ptBR),
    ro: () => import("date-fns/locale/ro").then(m => m.ro),
    ru: () => import("date-fns/locale/ru").then(m => m.ru),
    sk: () => import("date-fns/locale/sk").then(m => m.sk),
    sl: () => import("date-fns/locale/sl").then(m => m.sl),
    sr: () => import("date-fns/locale/sr").then(m => m.sr),
    srLatn: () => import("date-fns/locale/sr-Latn").then(m => m.srLatn),
    sv: () => import("date-fns/locale/sv").then(m => m.sv),
    ta: () => import("date-fns/locale/ta").then(m => m.ta),
    te: () => import("date-fns/locale/te").then(m => m.te),
    th: () => import("date-fns/locale/th").then(m => m.th),
    tr: () => import("date-fns/locale/tr").then(m => m.tr),
    ug: () => import("date-fns/locale/ug").then(m => m.ug),
    uk: () => import("date-fns/locale/uk").then(m => m.uk),
    uz: () => import("date-fns/locale/uz").then(m => m.uz),
    vi: () => import("date-fns/locale/vi").then(m => m.vi),
    zhCN: () => import("date-fns/locale/zh-CN").then(m => m.zhCN),
    zhTW: () => import("date-fns/locale/zh-TW").then(m => m.zhTW),
};

const cache = new Map<Locale, DateFnsLocale>();
const inFlight = new Map<Locale, Promise<DateFnsLocale | undefined>>();

/**
 * Load a date-fns locale, resolving from cache when it is already in memory.
 * Concurrent callers for the same locale share one request.
 */
export function loadDateFnsLocale(locale: Locale): Promise<DateFnsLocale | undefined> {
    const cached = cache.get(locale);
    if (cached) {
        return Promise.resolve(cached);
    }
    const pending = inFlight.get(locale);
    if (pending) {
        return pending;
    }
    const loader = loaders[locale];
    if (!loader) {
        // An unknown key behaves as it did when the whole barrel was imported:
        // the lookup missed and date-fns fell back to its built-in English.
        return Promise.resolve(undefined);
    }
    const promise = loader()
        .then((loaded) => {
            cache.set(locale, loaded);
            return loaded;
        })
        .catch(() => undefined)
        .finally(() => {
            inFlight.delete(locale);
        });
    inFlight.set(locale, promise);
    return promise;
}

/** The locale if it is already loaded, otherwise undefined. Never suspends. */
export function getLoadedDateFnsLocale(locale?: Locale): DateFnsLocale | undefined {
    return locale ? cache.get(locale) : undefined;
}

/**
 * The date-fns locale for `locale`, loading it in the background on first use.
 *
 * Returns undefined until the chunk arrives, which formats the first paint with
 * date-fns' built-in English and then re-renders. That is a change only for
 * projects that set a locale, and only for the few hundred milliseconds before
 * the chunk lands — in exchange for every project no longer waiting on 625KB.
 */
export function useDateFnsLocale(locale?: Locale): DateFnsLocale | undefined {
    const [, forceUpdate] = useReducer((count: number) => count + 1, 0);

    useEffect(() => {
        if (!locale || cache.has(locale)) {
            return;
        }
        let active = true;
        loadDateFnsLocale(locale).then((loaded) => {
            if (active && loaded) {
                forceUpdate();
            }
        });
        return () => {
            active = false;
        };
    }, [locale]);

    return locale ? cache.get(locale) : undefined;
}
