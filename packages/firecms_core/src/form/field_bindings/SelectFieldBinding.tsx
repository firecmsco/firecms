import React, { useCallback } from "react";

import { EnumType, FieldProps } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { EnumValuesChip } from "../../preview";
import { getIconForProperty, resolveEnumValues } from "../../util";
import { CloseIcon, cls, IconButton, Select, SelectItem } from "@firecms/ui";
import { useClearRestoreValue } from "../useClearRestoreValue";
import { PropertyIdCopyTooltip } from "../../components";

type SelectProps<T extends EnumType> = FieldProps<T>;

/**
 * If `enumValues` are set in the string config, this field renders a select
 * where each option is a colored chip.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @group Form fields
 */
export function SelectFieldBinding<T extends EnumType>({
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
                                                       }: SelectProps<T>) {

    const enumValues = resolveEnumValues(property.enumValues ?? []);

    useClearRestoreValue({
        property,
        value,
        setValue
    });

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
                            className={"h-6 text-text-secondary dark:text-text-secondary-dark ml-3.5 my-0"}
                        />
                    </PropertyIdCopyTooltip>}
                endAdornment={
                    property.clearable && !disabled && <IconButton
                        onClick={handleClearClick}>
                        <CloseIcon/>
                    </IconButton>
                }
                onValueChange={(updatedValue: string) => {
                    const newValue = updatedValue
                        ? (property.dataType === "number" ? parseFloat(updatedValue) : updatedValue)
                        : null;
                    return setValue(newValue as T);
                }}
                renderValue={(enumKey: any) => {
                    return <EnumValuesChip
                        enumKey={enumKey}
                        enumValues={enumValues}
                        size={size}/>;
                }}
            >
                {enumValues && enumValues.map((option) => {
                    return <SelectItem
                        key={option.id}
                        value={String(option.id)}>
                        <EnumValuesChip
                            enumKey={String(option.id)}
                            enumValues={enumValues}
                            size={size}/>
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
