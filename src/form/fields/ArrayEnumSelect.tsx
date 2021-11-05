import { EnumType, FieldProps } from "../../models";
import {
    Checkbox,
    FormControl,
    FormHelperText,
    InputLabel,
    ListItemText,
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
import { ArrayEnumPreview } from "../../preview/components/ArrayEnumPreview";

/**
 * This fields renders a dropdown with multiple selection.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayEnumSelect({
                                    name,
                                    value,
                                    setValue,
                                    error,
                                    showError,
                                    disabled,
                                    property,
                                    includeDescription,
                                    autoFocus
                                }: FieldProps<EnumType[]>) {

    const classes = formStyles();

    if (!property.of) {
        throw Error("Using wrong component ArrayEnumSelect");
    }

    if (property.of.dataType !== "string" && property.of.dataType !== "number") {
        throw Error("Field misconfiguration: array field of type string or number");
    }

    const enumValues = property.of.config?.enumValues;
    if (!enumValues) {
        console.error(property);
        throw Error("Field misconfiguration: array field of type string or number needs to have enumValues");
    }
    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const validValue = !!value && Array.isArray(value);
    return (
        <FormControl
            variant="filled"
            fullWidth
            required={property.validation?.required}
            error={showError}
        >

            <InputLabel id={`${name}-multiselect-label`}
                        classes={{
                            root: classes.inputLabel,
                            shrink: classes.shrinkInputLabel
                        }}>
                <LabelWithIcon property={property}/>
            </InputLabel>

            <MuiSelect
                multiple
                classes={{
                    root: classes.input
                }}
                variant={"filled"}
                labelId={`${name}-multiselect-label`}
                value={validValue ? value.map(v => v.toString()) : []}
                autoFocus={autoFocus}
                disabled={disabled}
                onChange={(evt: any) => {
                    let newValue;
                    if (property.of?.dataType === "number")
                        newValue = evt.target.value ? evt.target.value.map((e: any) => parseFloat(e)) : [];
                    else
                        newValue = evt.target.value;
                    return setValue(
                        newValue
                    );
                }}
                renderValue={(selected: any) => (
                    <ArrayEnumPreview value={selected}
                                      name={name}
                                      enumValues={enumValues}
                                      size={"regular"}/>
                )}>

                {enumToObjectEntries(enumValues)
                    .map(([enumKey, labelOrConfig]) => {
                        const checked = validValue && value.map(v => v.toString()).includes(enumKey.toString());
                        return (
                            <MenuItem key={`form-select-${name}-${enumKey}`}
                                      value={enumKey}
                                      disabled={isEnumValueDisabled(labelOrConfig)}
                                      dense={true}>
                                <Checkbox checked={checked}/>
                                <ListItemText primary={
                                    <EnumValuesChip
                                        enumKey={enumKey}
                                        enumValues={enumValues}
                                        small={true}/>
                                }/>
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
