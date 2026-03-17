import { useTranslation as useI18nTranslation } from "react-i18next";
import { FireCMSTranslations } from "../types/translations";

const FIRECMS_NS = "firecms_core";

/**
 * Internal hook for translating FireCMS UI strings.
 *
 * Uses the `firecms_core` i18next namespace that is initialised by
 * `FireCMSi18nProvider`. Do NOT use `react-i18next` directly in internal
 * components — always go through this hook so the namespace is consistent.
 *
 * @example
 * const { t } = useTranslation();
 * <Button>{t("save")}</Button>
 *
 * @internal
 */
export function useTranslation() {
    const { t, i18n } = useI18nTranslation(FIRECMS_NS);

    /**
     * Typed translation function scoped to FirecmsTranslations keys.
     * Also supports i18next interpolation variables, e.g.
     *   t("add_to_field", { fieldName: "Tags" })
     *   t("error_deleting", { message: err.message })
     */
    const typedT = (key: keyof FireCMSTranslations | (string & {}), vars?: Record<string, string>): string =>
        t(key, vars) as string;

    return { t: typedT, i18n };
}
