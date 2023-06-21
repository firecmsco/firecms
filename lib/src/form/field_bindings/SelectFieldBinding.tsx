import React, { useCallback } from "react";
import clsx from "clsx";

import { FormHelperText } from "@mui/material";

import { EnumType, FieldProps } from "../../types";
import { FieldDescription, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { EnumValuesChip } from "../../preview";
import { getIconForProperty, Select } from "../../core";
import InputLabel from "../../components/InputLabel";
import { IconButton } from "../../components";
import ClearIcon from "@mui/icons-material/Clear";
import { focusedMixin } from "../../styles";

type SelectProps<T extends EnumType> = FieldProps<T>;

/**
 * If `enumValues` are set in the string config, this field renders a select
 * where each option is a colored chip.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
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
                inputClassName={clsx(
                    "w-full",
                    property.clearable ? "pr-14" : "")}

                label={<InputLabel id={`${propertyKey}-select-label`}
                                   shrink={Boolean(value)}>
                    <LabelWithIcon icon={getIconForProperty(property)}
                                   required={property.validation?.required}
                                   title={property.name}/>
                </InputLabel>}
                endAdornment={
                    property.clearable && <IconButton
                        onClick={handleClearClick}>
                        <ClearIcon/>
                    </IconButton>
                }
                onValueChange={(updatedValue: any) => {
                    const newValue = updatedValue
                        ? (property.dataType === "number" ? parseFloat(updatedValue) : updatedValue)
                        : null;
                    return setValue(newValue);
                }}
                renderOption={(enumKey: any) => {
                    return <EnumValuesChip
                        enumKey={enumKey}
                        enumValues={enumValues}
                        small={false}/>;
                }}
                options={enumValues?.map((enumConfig) => String(enumConfig.id)) ?? []}
            />

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError && <FormHelperText error={true}>{error}</FormHelperText>}

        </>
    );
}
