import { EnumType, EnumValues, FieldProps } from "../../models";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect
} from "@mui/material";
import React from "react";
import { FieldDescription } from "../../form/components";
import { LabelWithIcon } from "../components/LabelWithIcon";
import { useClearRestoreValue } from "../../hooks";
import {
    enumToObjectEntries,
    isEnumValueDisabled
} from "../../core/util/enums";
import { EnumValuesChip } from "../../preview/components/CustomChip";
import { formStyles } from "../styles";

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
                                               dependsOnOtherProperties
                                           }: SelectProps<T>) {

    const classes = formStyles();
    const enumValues = property.config?.enumValues as EnumValues;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    return (
        <FormControl
            variant="filled"
            fullWidth
            required={property.validation?.required}
            error={showError}
            disabled={disabled}
        >

            <InputLabel id={`${name}-select-label`}
                        classes={{
                            root: classes.inputLabel,
                            shrink: classes.shrinkInputLabel
                        }}>
                <LabelWithIcon property={property}/>
            </InputLabel>

            <MuiSelect
                classes={{
                    root: classes.input
                }}
                variant={"filled"}
                labelId={`${name}-select-label`}
                autoFocus={autoFocus}
                value={value !== undefined ? value : ""}
                disabled={disabled}
                onChange={(evt: any) => {
                    const eventValue = evt.target.value;
                    const newValue = eventValue ?
                        (property.dataType === "number" ? parseFloat(eventValue) : eventValue)
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
