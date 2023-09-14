import * as locales from "date-fns/locale";
// @ts-ignore
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { useEffect } from "react";

export function useLocaleConfig(locale?: string) {
    useEffect(() => {
        if (!locale) {
            return;
        }
        // @ts-ignore
        const dateFnsLocale = locales[locale];
        if (dateFnsLocale) {
            registerLocale(locale, dateFnsLocale);
            setDefaultLocale(locale);
        }
    }, [locale])
}
