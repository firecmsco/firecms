import React, { useState } from "react";
import { Alert, Button, CloseIcon, IconButton } from "@firecms/ui";
import { AccessResponse } from "../types";
import { getLicenseSubscribeUrl } from "../core/pro_plugins";
import { useLicenseStatus } from "../hooks/useLicenseStatus";
import { useTranslation } from "../hooks/useTranslation";

const DISMISSED_STORAGE_KEY = "firecms_license_banner_dismissed";
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
    dismissible: boolean;
};

/**
 * Tells the user where their FireCMS PRO license stands: days left in the
 * trial, or why PRO is paused (the trial ended, the key is not linked to this
 * project, or the license pays for other projects). Renders nothing when
 * licensed, when no license is needed, and while the status is unknown.
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

    // States dismissed in this browser session; a different state shows again.
    const [dismissed, setDismissed] = useState<string[]>(readDismissed);

    // `language`, not `resolvedLanguage`: locale bundles are added after init,
    // and `resolvedLanguage` stays on the English fallback when they are.
    const content = licenseStatus
        ? buildBannerContent(licenseStatus, t, i18n?.language)
        : null;

    if (!content || (content.dismissible && dismissed.includes(content.state)))
        return null;

    const dismiss = () => {
        const next = [...dismissed, content.state];
        writeDismissed(next);
        setDismissed(next);
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
                    {content.dismissible && <IconButton
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
                            language: string | undefined): BannerContent | null {
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
                dismissible: true
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
                dismissible: false
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
                dismissible: false
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
                dismissible: false
            };
        }
        default:
            // licensed, not_required, whitelisted, and servers too old to say
            return null;
    }
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

function readDismissed(): string[] {
    try {
        const value = sessionStorage.getItem(DISMISSED_STORAGE_KEY);
        const parsed = value ? JSON.parse(value) : [];
        return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
    } catch {
        return [];
    }
}

function writeDismissed(states: string[]) {
    try {
        sessionStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(states));
    } catch {
        // Private mode or storage disabled: dismissed for this page view only.
    }
}
