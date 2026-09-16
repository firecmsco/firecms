import React from "react";
import { getLicenseSubscribeUrl, useLicenseStatus, useTranslation } from "@firecms/core";
import { Button, Paper, Typography } from "@firecms/ui";

/**
 * Shown by the Users and Roles views instead of their editors while FireCMS
 * PRO is paused. The user management plugin itself stays mounted, so sign-in
 * and role checks keep working; only editing users and roles is paused.
 */
export function UserManagementPausedNotice() {
    const { t } = useTranslation();
    const licenseStatus = useLicenseStatus();
    const linkLabel = licenseStatus?.licenseState === "invalid_project"
        ? t("license_add_project_to_license")
        : licenseStatus?.licenseState === "over_quota"
            ? t("license_update_license")
            : t("license_get_license");

    return (
        <Paper
            className={"flex flex-col items-start px-4 py-6 bg-white dark:bg-surface-accent-800 gap-2"}>
            <Typography variant={"subtitle2"} className={"uppercase"}>
                {t("pro_features_paused")}
            </Typography>
            <Typography>
                {t("user_management_paused_description")}
            </Typography>
            <Button
                component={"a"}
                href={getLicenseSubscribeUrl(licenseStatus)}
                target={"_blank"}
                rel={"noopener noreferrer"}>
                {linkLabel}
            </Button>
        </Paper>
    );
}
