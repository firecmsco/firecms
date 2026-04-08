import type { PropertyPreviewProps } from "../../types/components/PropertyPreviewProps";
import type { StringProperty } from "@rebasepro/types";
import React from "react";
import { useInternalUserManagementController } from "@rebasepro/core";
import { UserDisplay } from "@rebasepro/core";
import { EmptyValue } from "./EmptyValue";
import { Typography } from "@rebasepro/ui";
import { User } from "@rebasepro/types";

/**
 * Preview component for displaying user information.
 * This is a simple wrapper around UserDisplay.
 *
 * @group Preview components
 */
export function UserPreview({ value }: PropertyPreviewProps<StringProperty>) {
    const getUser = useInternalUserManagementController<User>()?.getUser;

    if (!value) {
        return <EmptyValue />;
    }

    const user = getUser?.(value);
    if (!user) {
        return <Typography variant={"caption"} color={"secondary"}>User not found: {value}</Typography>;
    }

    return <UserDisplay user={user} />;
}
