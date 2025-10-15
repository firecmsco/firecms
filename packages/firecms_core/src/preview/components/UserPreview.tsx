import React from "react";
import { PropertyPreviewProps } from "../PropertyPreviewProps";
import { useInternalUserManagementController } from "../../hooks";
import { UserDisplay } from "../../components/UserDisplay";
import { EmptyValue } from "./EmptyValue";
import { Typography } from "@firecms/ui";

/**
 * Preview component for displaying user information.
 * This is a simple wrapper around UserDisplay.
 *
 * @group Preview components
 */
export function UserPreview({ value }: PropertyPreviewProps<string>) {
    const { getUser } = useInternalUserManagementController();

    if (!value) {
        return <EmptyValue/>;
    }

    const user = getUser(value);
    if (!user) {
        return <Typography variant={"caption"} color={"secondary"}>User not found: {value}</Typography>;
    }

    return <UserDisplay user={user}/>;
}
