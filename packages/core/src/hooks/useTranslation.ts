import { useTranslation as useI18nTranslation } from "react-i18next";

const REBASE_NS = "rebase_core";

/**
 * Internal hook for translating FireCMS UI strings.
 *
 * Uses the `rebase_core` i18next namespace that is initialised by
 * `RebaseI18nProvider`. Do NOT use `react-i18next` directly in internal
 * components — always go through this hook so the namespace is consistent.
 *
 * @example
 * const { t } = useTranslation();
 * <Button>{t("save")}</Button>
 *
 * @internal
 */
export function useTranslation() {
    const { t, i18n } = useI18nTranslation(REBASE_NS);

    /**
     * Typed translation function scoped to FirecmsTranslations keys.
     * Also supports i18next interpolation variables, e.g.
     *   t("add_to_field", { fieldName: "Tags" })
     *   t("error_deleting", { message: err.message })
     */
    const typedT = (key: string, vars?: Record<string, string>): string =>
        t(key, vars) as string;

    return { t: typedT, i18n };
}
