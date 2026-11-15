import React from "react";
import { PropertyPreviewProps } from "../PropertyPreviewProps.js";
import { useInternalUserManagementController } from "../../hooks/index.js";
import { UserDisplay } from "../../components/UserDisplay.js";
import { EmptyValue } from "./EmptyValue.js";
import { Typography } from "@firecms/ui";
import { useTranslation } from "../../hooks/useTranslation.js";

/**
 * Preview component for displaying user information.
 * This is a simple wrapper around UserDisplay.
 *
 * @group Preview components
 */
export function UserPreview({ value }: PropertyPreviewProps<string>) {
    const { getUser } = useInternalUserManagementController();
    const { t } = useTranslation();

    if (!value) {
        return <EmptyValue/>;
    }

    const user = getUser(value);
    if (!user) {
        return <Typography variant={"caption"} color={"secondary"}>{t("user_not_found", { value })}</Typography>;
    }

    return <UserDisplay user={user}/>;
}
