import React, { useCallback } from "react";
import {
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";

import { EnumType, FieldProps } from "../../types";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { isEnumValueDisabled } from "../../core/util/enums";
import { EnumValuesChip } from "../../preview";
import { getIconForProperty } from "../../core";

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

    const handleClearClick = useCallback(() => {
        setValue(null);
    }, [setValue]);

    return (
        <FormControl
            fullWidth
            required={property.validation?.required}
            error={showError}
            disabled={disabled}
            sx={{
                "& .MuiInputLabel-root": {
                    mt: 1 / 2,
                    ml: 1 / 2
                },
                "& .MuiInputLabel-shrink": {
                    mt: 2
                }
            }}
        >

            <InputLabel id={`${propertyKey}-select-label`}>
                <LabelWithIcon icon={getIconForProperty(property)}
                                 title={property.name}/>
            </InputLabel>

            <MuiSelect
                sx={(theme) => ({
                    minHeight: "64px",
                    borderRadius: `${theme.shape.borderRadius}px`
                })}
                variant={"filled"}
                labelId={`${propertyKey}-select-label`}
                autoFocus={autoFocus}
                value={value ?? ""}
                disabled={disabled}
                disableUnderline={true}
                endAdornment={
                    property.clearable && <IconButton
                        sx={{
                            position: "absolute",
                            top: "12px",
                            right: "32px"
                        }}
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
