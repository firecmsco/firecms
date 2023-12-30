import React, { useCallback } from "react";

import { EnumType, FieldProps } from "../../types";
import { FieldHelperText, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { EnumValuesChip } from "../../preview";
import { getIconForProperty } from "../../util";
import { ClearIcon, cn, IconButton, Select, SelectItem } from "@firecms/ui";

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
                                                           includeDescription
                                                       }: SelectProps<T>) {

    const enumValues = property.enumValues;

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
                value={value ? value.toString() : ""}
                disabled={disabled}
                position="item-aligned"
                inputClassName={cn("w-full")}
                label={<LabelWithIcon icon={getIconForProperty(property, "small")}
                                      required={property.validation?.required}
                                      title={property.name}
                                      className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}
                />}
                endAdornment={
                    property.clearable && <IconButton
                        onClick={handleClearClick}>
                        <ClearIcon/>
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
                        size={"medium"}/>;
                }}
            >
                {enumValues && enumValues.map((option) => {
                    return <SelectItem
                        key={option.id}
                        value={String(option.id)}>
                        <EnumValuesChip
                            enumKey={String(option.id)}
                            enumValues={enumValues}
                            size={"medium"}/>
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
