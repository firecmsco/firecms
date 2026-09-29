import React, { useContext, useState } from "react";
import { Alert, Button, CloseIcon, IconButton } from "@firecms/ui";
import { AccessResponse, ProSuggestion } from "../types";
import { getLicenseSubscribeUrl, PRO_PLUGIN_KEYS } from "../core/pro_plugins";
import { CustomizationControllerContext } from "../contexts/CustomizationControllerContext";
import { useLicenseStatus } from "../hooks/useLicenseStatus";
import { useTranslation } from "../hooks/useTranslation";

const DISMISSED_STORAGE_KEY = "firecms_license_banner_dismissed";
const DISMISSED_SUGGESTIONS_STORAGE_KEY = "firecms_pro_suggestions_dismissed";
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * @group Components
 */
export interface LicenseBannerProps {
    /**
     * Applied to the banner's outer element when there is something to show.
     */
    className?: string;
    style?: React.CSSProperties;
}

type BannerContent = {
    state: string;
    color: "info" | "warning";
    message: string;
    linkLabel: string;
    href: string;
    /**
     * `session` hides it until the browser session ends, `forever` in this
     * browser for good.
     */
    dismissal: "none" | "session" | "forever";
};

/**
 * Where each PRO suggestion links: the plugin's docs, which say how to add it.
 * The UTM parameters let the website count the clicks.
 */
const SUGGESTION_DOCS_URLS: Record<ProSuggestion["plugin"], string> = {
    user_management: "https://firecms.co/docs/pro/user_management/?utm_source=firecms&utm_medium=cms_suggestion&utm_campaign=user_management",
    entity_history: "https://firecms.co/docs/pro/entity_history/?utm_source=firecms&utm_medium=cms_suggestion&utm_campaign=entity_history"
};

/**
 * Tells the user where their FireCMS PRO license stands: days left in the
 * trial, or why PRO is paused (the trial ended, the key is not linked to this
 * project, or the license pays for other projects). Renders nothing when
 * licensed and while the status is unknown. When no license is needed, it
 * shows only a PRO plugin the license check suggests for this project, if any.
 *
 * The default `Scaffold` already renders it above the main content. Place it
 * yourself only in a custom layout.
 *
 * @group Components
 */
export function LicenseBanner({
                                  className,
                                  style
                              }: LicenseBannerProps) {

    const licenseStatus = useLicenseStatus();
    const { t, i18n } = useTranslation();

    // The server answers `not_required` to every localhost and FireCMS Cloud
    // request, whatever the app mounts, so a suggestion is only shown to an
    // app that really runs no PRO plugin.
    const plugins = useContext(CustomizationControllerContext)?.plugins;
    const runsProPlugin = plugins?.some(plugin => PRO_PLUGIN_KEYS.includes(plugin.key)) ?? false;

    // States dismissed in this browser session; a different state shows again.
    const [dismissed, setDismissed] = useState<string[]>(() => readDismissed(sessionDismissals));
    // Suggestions dismissed in this browser, for good.
    const [dismissedForGood, setDismissedForGood] = useState<string[]>(() => readDismissed(browserDismissals));

    // `language`, not `resolvedLanguage`: locale bundles are added after init,
    // and `resolvedLanguage` stays on the English fallback when they are.
    const content = licenseStatus
        ? buildBannerContent(licenseStatus, t, i18n?.language, runsProPlugin)
        : null;

    if (!content
        || (content.dismissal === "session" && dismissed.includes(content.state))
        || (content.dismissal === "forever" && dismissedForGood.includes(content.state)))
        return null;

    const dismiss = () => {
        if (content.dismissal === "forever") {
            const next = [...dismissedForGood, content.state];
            writeDismissed(browserDismissals, next);
            setDismissedForGood(next);
        } else {
            const next = [...dismissed, content.state];
            writeDismissed(sessionDismissals, next);
            setDismissed(next);
        }
    };

    return (
        <div className={className} style={style}>
            <Alert
                color={content.color}
                size={"small"}
                className={"text-sm"}
                action={<div className={"flex flex-row items-center gap-1 flex-shrink-0"}>
                    <Button
                        variant={"text"}
                        size={"small"}
                        component={"a"}
                        href={content.href}
                        target={"_blank"}
                        rel={"noopener noreferrer"}>
                        {content.linkLabel}
                    </Button>
                    {content.dismissal !== "none" && <IconButton
                        size={"small"}
                        aria-label={t("close")}
                        onClick={dismiss}>
                        <CloseIcon size={"small"}/>
                    </IconButton>}
                </div>}>
                {content.message}
            </Alert>
        </div>
    );
}

type Translate = ReturnType<typeof useTranslation>["t"];

function buildBannerContent(status: AccessResponse,
                            t: Translate,
                            language: string | undefined,
                            runsProPlugin: boolean): BannerContent | null {
    const href = getLicenseSubscribeUrl(status);
    switch (status.licenseState) {
        case "trial": {
            const days = trialDaysLeft(status);
            if (days === null) return null;
            return {
                state: "trial",
                color: "info",
                message: t("license_trial_banner", {
                    count: days,
                    days: String(days)
                }),
                linkLabel: t("license_get_license"),
                href,
                dismissal: "session"
            };
        }
        case "expired": {
            const date = formatDate(status.trialEndsAt, language);
            return {
                state: "expired",
                color: "warning",
                message: date
                    ? t("license_expired_banner", { date })
                    : t("license_expired_banner_undated"),
                linkLabel: t("license_get_license"),
                href,
                dismissal: "none"
            };
        }
        case "invalid_project":
            return {
                state: "invalid_project",
                color: "warning",
                message: status.projectId
                    ? t("license_invalid_project_banner", { projectId: status.projectId })
                    : t("license_invalid_project_banner_unnamed"),
                linkLabel: t("license_add_project_to_license"),
                href,
                dismissal: "none"
            };
        case "over_quota": {
            const licensed = status.licensedProjects;
            if (!isCount(licensed)) return null;
            return {
                state: "over_quota",
                color: "warning",
                message: t("license_over_quota_banner", {
                    count: licensed,
                    licensed: String(licensed)
                }),
                linkLabel: t("license_update_license"),
                href,
                dismissal: "none"
            };
        }
        case "not_required":
            return runsProPlugin ? null : buildSuggestionContent(status.suggestion, t);
        default:
            // licensed, whitelisted, and servers too old to say
            return null;
    }
}

function buildSuggestionContent(suggestion: ProSuggestion | undefined,
                                t: Translate): BannerContent | null {
    if (!suggestion || typeof suggestion !== "object") return null;
    let message: string;
    switch (suggestion.plugin) {
        case "user_management": {
            const users = suggestion.users;
            // The copy is plural only: one person is not a reason to suggest roles.
            message = isCount(users) && users >= 2
                ? t("pro_suggestion_user_management", { users: String(Math.floor(users)) })
                : t("pro_suggestion_user_management_uncounted");
            break;
        }
        case "entity_history":
            message = t("pro_suggestion_entity_history");
            break;
        default:
            // A plugin this version has no copy for.
            return null;
    }
    return {
        state: `suggestion_${suggestion.plugin}`,
        color: "info",
        message,
        linkLabel: t("pro_suggestion_learn_more"),
        href: SUGGESTION_DOCS_URLS[suggestion.plugin],
        dismissal: "forever"
    };
}

function isCount(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function trialDaysLeft(status: AccessResponse): number | null {
    if (isCount(status.daysLeft)) return Math.ceil(status.daysLeft);
    const end = status.trialEndsAt ? new Date(status.trialEndsAt).getTime() : NaN;
    if (Number.isNaN(end)) return null;
    return Math.max(0, Math.ceil((end - Date.now()) / DAY_MS));
}

function formatDate(iso: string | undefined, language: string | undefined): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    try {
        return new Intl.DateTimeFormat(language, options).format(date);
    } catch {
        return date.toLocaleDateString(undefined, options);
    }
}

type DismissedStore = {
    storage: () => Storage;
    key: string;
};

const sessionDismissals: DismissedStore = {
    storage: () => sessionStorage,
    key: DISMISSED_STORAGE_KEY
};

const browserDismissals: DismissedStore = {
    storage: () => localStorage,
    key: DISMISSED_SUGGESTIONS_STORAGE_KEY
};

function readDismissed(store: DismissedStore): string[] {
    try {
        const value = store.storage().getItem(store.key);
        const parsed = value ? JSON.parse(value) : [];
        return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
    } catch {
        return [];
    }
}

function writeDismissed(store: DismissedStore, states: string[]) {
    try {
        store.storage().setItem(store.key, JSON.stringify(states));
    } catch {
        // Private mode or storage disabled: dismissed for this page view only.
    }
}
