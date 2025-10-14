import React, { useCallback } from "react";

import { FieldProps, User } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { getIconForProperty } from "../../util";
import { CloseIcon, cls, IconButton, Select, SelectItem } from "@firecms/ui";
import { PropertyIdCopyTooltip } from "../../components";
import { useInternalUserManagementController } from "../../hooks";
import { UserDisplay } from "../../components/UserDisplay";

type UserSelectProps = FieldProps<string>;

/**
 * Field binding for selecting a user from the internal user management system.
 * Renders a select dropdown with user information including name and email.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function UserSelectFieldBinding({
                                           propertyKey,
                                           value,
                                           setValue,
                                           error,
                                           showError,
                                           disabled,
                                           autoFocus,
                                           touched,
                                           property,
                                           includeDescription,
                                           size = "large"
                                       }: UserSelectProps) {

    const { users, getUser } = useInternalUserManagementController();

    const handleClearClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setValue(null);
    }, [setValue]);

    return (
        <>
            <Select
                value={value !== undefined && value != null ? value.toString() : ""}
                disabled={disabled}
                size={size}
                fullWidth={true}
                position="item-aligned"
                inputClassName={cls("w-full")}
                label={
                    <PropertyIdCopyTooltip propertyKey={propertyKey}>
                        <LabelWithIcon
                            icon={getIconForProperty(property, "small")}
                            required={property.validation?.required}
                            title={property.name}
                            className={"h-8 text-text-secondary dark:text-text-secondary-dark ml-3.5 my-0"}
                        />
                    </PropertyIdCopyTooltip>}
                endAdornment={
                    property.clearable && !disabled && value && <IconButton
                        size="small"
                        onClick={handleClearClick}>
                        <CloseIcon size={"small"}/>
                    </IconButton>
                }
                onValueChange={(updatedValue: string) => {
                    const newValue = updatedValue || null;
                    return setValue(newValue);
                }}
                renderValue={(userId: string) => {
                    const user = getUser(userId);
                    return <UserDisplay user={user} />;
                }}
            >
                {users && users.map((user) => {
                    return <SelectItem
                        key={user.uid}
                        value={user.uid}>
                        <UserDisplay user={user}  />
                    </SelectItem>
                })}
            </Select>

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             disabled={disabled}
                             property={property}/>

        </>
    );
}
