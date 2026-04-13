import React, { useCallback, useState } from "react";
import {
    Alert,
    Button,
    CheckIcon,
    CircularProgress,
    cls,
    ContentCopyIcon,
    IconButton,
    OpenInNewIcon,
    Tooltip,
    Typography,
} from "@firecms/ui";
import { EntityCollection, useTranslation } from "@firecms/core";
import { ProjectsApi } from "../api/projects";

const FIRECMS_RULE_SNIPPET = `match /{document=**} {
    allow read, write: if request.auth.token.fireCMSUser;
}`;

export type PermissionErrorViewProps = {
    path: string;
    collection: EntityCollection;
    parentCollectionIds?: string[];
    error: Error;
    projectId: string;
    projectsApi: ProjectsApi;
    onAnalyticsEvent?: (event: string, data?: object) => void;
};

/**
 * Custom error view for the SaaS plugin that detects "Missing or insufficient permissions"
 * and provides actionable CTAs to fix it.
 *
 * For non-permission errors, returns null to fall back to the default error view.
 */
export function PermissionErrorView({
    path,
    collection,
    error,
    projectId,
    projectsApi,
    onAnalyticsEvent,
}: PermissionErrorViewProps) {

    const { t } = useTranslation();

    const isPermissionError =
        error.message?.toLowerCase().includes("permission") ||
        error.message?.toLowerCase().includes("insufficient");

    const [fixing, setFixing] = useState(false);
    const [fixed, setFixed] = useState(false);
    const [fixError, setFixError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleFixAutomatically = useCallback(async () => {
        onAnalyticsEvent?.("permission_error_fix_click", { path, projectId });
        setFixing(true);
        setFixError(null);
        try {
            await projectsApi.addSecurityRules(projectId);
            setFixed(true);
            onAnalyticsEvent?.("permission_error_fix_success", { path, projectId });
        } catch (e: any) {
            console.error("Failed to add security rules:", e);
            setFixError(e?.message || "Failed to add security rules. Please try manually.");
            onAnalyticsEvent?.("permission_error_fix_error", { path, projectId });
        } finally {
            setFixing(false);
        }
    }, [projectsApi, projectId, path, onAnalyticsEvent]);

    const handleCopyRule = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(FIRECMS_RULE_SNIPPET);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback - ignore
        }
    }, []);

    const rulesConsoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/rules`;

    if (!isPermissionError) {
        // Not a permission error — fall back to default error rendering
        return null;
    }

    return (
        <div className={"flex-1 flex items-center justify-center p-8"}>
            <div className={cls(
                "max-w-lg w-full flex flex-col gap-6",
                "p-8 rounded-xl",
                "bg-surface-50 dark:bg-surface-900",
                "border border-surface-200 dark:border-surface-700"
            )}>

                <div className={"flex flex-col gap-2"}>
                    <Typography variant={"h6"} className={"text-red-600 dark:text-red-400"}>
                        {t("missing_firestore_security_rules")}
                    </Typography>

                    <Typography variant={"body2"} color={"secondary"}>
                        {t("firecms_cloud_requires_security_rule")} <strong>{path}</strong> {t("cannot_be_accessed_without_it")}
                    </Typography>
                </div>

                {/* Rule snippet */}
                <div className={"flex flex-col gap-1"}>
                    <div className={"flex items-center justify-between"}>
                        <Typography variant={"caption"} color={"secondary"}>
                            {t("required_security_rule")}
                        </Typography>
                        <Tooltip title={copied ? "Copied!" : "Copy rule"}>
                            <IconButton size={"small"} onClick={handleCopyRule}>
                                {copied ? <CheckIcon size={"smallest"}/> : <ContentCopyIcon size={"smallest"}/>}
                            </IconButton>
                        </Tooltip>
                    </div>
                    <pre className={cls(
                        "text-xs p-3 rounded-lg overflow-x-auto",
                        "bg-surface-100 dark:bg-surface-800",
                        "text-surface-800 dark:text-surface-200",
                        "border border-surface-200 dark:border-surface-700"
                    )}>
                        {FIRECMS_RULE_SNIPPET}
                    </pre>
                </div>

                {/* Status messages */}
                {fixed && (
                    <Alert color={"success"}>
                        {t("security_rules_updated_successfully")}
                    </Alert>
                )}

                {fixError && (
                    <Alert color={"error"}>
                        {fixError}
                    </Alert>
                )}

                {/* CTAs */}
                <div className={"flex flex-col sm:flex-row gap-3"}>
                    <Button
                        onClick={handleFixAutomatically}
                        disabled={fixing || fixed}
                        variant={"filled"}
                    >
                        {fixing
                            ? <><CircularProgress size={"smallest"}/> {t("sec_rules_fixing")}</>
                            : fixed
                                ? <><CheckIcon size={"small"}/> {t("sec_rules_fixed")}</>
                                : t("fix_automatically")
                        }
                    </Button>

                    <Button
                        component={"a"}
                        href={rulesConsoleUrl}
                        target={"_blank"}
                        rel={"noopener noreferrer"}
                        variant={"text"}
                    >
                        {t("open_firebase_rules")} <OpenInNewIcon size={"small"}/>
                    </Button>
                </div>

            </div>
        </div>
    );
}
