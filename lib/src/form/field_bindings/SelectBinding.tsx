import React from "react";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@mui/material";

import { EnumType, FieldProps } from "../../models";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { isEnumValueDisabled } from "../../core/util/enums";
import { EnumValuesChip } from "../../preview/components/CustomChip";

type SelectProps<T extends EnumType> = FieldProps<T>;

/**
 * If `enumValues` are set in the string config, this field renders a select
 * where each option is a colored chip.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function SelectBinding<T extends EnumType>({
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
                                               shouldAlwaysRerender
                                           }: SelectProps<T>) {

    const enumValues = property.enumValues;

    console.log("enumValues", enumValues);

    useClearRestoreValue({
        property,
        value,
        setValue
    });

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
                <LabelWithIcon property={property}/>
            </InputLabel>

            <MuiSelect
                sx={{
                    minHeight: "64px"
                }}
                variant={"filled"}
                labelId={`${propertyKey}-select-label`}
                autoFocus={autoFocus}
                value={value !== undefined ? value : ""}
                disabled={disabled}
                onChange={(evt: any) => {
                    const eventValue = evt.target.value;
                    const newValue = eventValue
                        ? (property.dataType === "number" ? parseFloat(eventValue) : eventValue)
                        : null;

                    return setValue(newValue);
                }}
                renderValue={(enumKey: any) => {
                    return <EnumValuesChip
                        enumId={enumKey}
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
                                enumId={enumConfig.id}
                                enumValues={enumValues}
                                small={true}/>
                        </MenuItem>
                    );
                    })}
            </MuiSelect>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}
