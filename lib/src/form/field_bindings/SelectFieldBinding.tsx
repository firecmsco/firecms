import React, { useCallback } from "react";
import { FormControl, FormHelperText, IconButton, MenuItem, Select as MuiSelect, useTheme } from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";

import { EnumType, FieldProps } from "../../types";
import { FieldDescription, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { isEnumValueDisabled } from "../../core/util/enums";
import { EnumValuesChip } from "../../preview";
import { getIconForProperty } from "../../core";
import TInputLabel from "../../migrated/TInputLabel";

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

    const theme = useTheme();
    const enumValues = property.enumValues;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const handleClearClick = useCallback(() => {
        setValue(null);
    }, [setValue]);

    return (
        <FormControl
            fullWidth
            error={showError}
            disabled={disabled}
            className="MuiInputLabel-root MuiInputLabel-shrink"
            style={{
                marginTop: '0.5rem',
                marginLeft: '0.5rem',
            }}
        >

            <TInputLabel id={`${propertyKey}-select-label`}>
                <LabelWithIcon icon={getIconForProperty(property)}
                               required={property.validation?.required}
                               title={property.name}/>
            </TInputLabel>

            <MuiSelect
                className={`min-h-[64px] rounded-[${theme.shape.borderRadius + "px"}]`}
                variant={"filled"}
                labelId={`${propertyKey}-select-label`}
                autoFocus={autoFocus}
                value={value ?? ""}
                disabled={disabled}
                disableUnderline={true}
                endAdornment={
                    property.clearable && <IconButton
                        className="absolute top-3 right-8"
                        onClick={handleClearClick}>
                        <ClearIcon/>
                    </IconButton>
                }
                onChange={(evt: any) => {
                    const eventValue = evt.target.value;
                    const newValue = eventValue
                        ? (property.dataType === "number" ? parseFloat(eventValue) : eventValue)
                        : null;

                    return setValue(newValue);
                }}
                renderValue={(enumKey: any) => {
                    return <EnumValuesChip
                        enumKey={enumKey}
                        enumValues={enumValues}
                        small={false}/>;
                }
                }>

                {enumValues && enumValues.map((enumConfig) => {
                    return (
                        <MenuItem key={`select_${propertyKey}_${enumConfig.id}`}
                                  value={enumConfig.id}
                                  disabled={isEnumValueDisabled(enumConfig)}>
                            <EnumValuesChip
                                enumKey={enumConfig.id}
                                enumValues={enumValues}
                                small={true}/>
                        </MenuItem>
                    );
                })}
            </MuiSelect>

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError && <FormHelperText error={true}>{error}</FormHelperText>}

        </FormControl>
    );
}
