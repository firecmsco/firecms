import React from "react";
import { PropertyPreviewProps } from "../PropertyPreviewProps";
import { useInternalUserManagementController } from "../../hooks";
import { UserDisplay } from "../../components/UserDisplay";

/**
 * Preview component for displaying user information.
 * This is a simple wrapper around UserDisplay.
 *
 * @group Preview components
 */
export function UserPreview({ value }: PropertyPreviewProps<string>) {
    const { getUser } = useInternalUserManagementController();

    if (!value) {
        return null;
    }

    const user = getUser(value);

    return <UserDisplay user={user}  />;
}
