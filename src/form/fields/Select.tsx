import React from "react";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@mui/material";

import { EnumType, EnumValues, FieldProps } from "../../models";
import { FieldDescription } from "../../form";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import {
    enumToObjectEntries,
    isEnumValueDisabled
} from "../../core/util/enums";
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
export function Select<T extends EnumType>({
                                               name,
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

    const enumValues = property.enumValues as EnumValues;

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
                '& .MuiInputLabel-root': {
                    mt: 1 / 2,
                    ml: 1 / 2,
                },
                '& .MuiInputLabel-shrink': {
                    mt: 2
                },
            }}
        >

            <InputLabel id={`${name}-select-label`}>
                <LabelWithIcon property={property}/>
            </InputLabel>

            <MuiSelect
                sx={{
                    minHeight: "64px"
                }}
                variant={"filled"}
                labelId={`${name}-select-label`}
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
                        enumKey={enumKey}
                        enumValues={enumValues}
                        small={false}/>;
                }
                }>

                {enumToObjectEntries(enumValues)
                    .map(([enumKey, labelOrConfig]) => {
                        return (
                            <MenuItem key={`select_${name}_${enumKey}`}
                                      value={enumKey}
                                      disabled={isEnumValueDisabled(labelOrConfig)}>
                                <EnumValuesChip
                                    enumKey={enumKey}
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
