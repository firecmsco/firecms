import React, { useCallback } from "react";
import {
    Checkbox,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    Select as MuiSelect
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";

import { EnumType, FieldProps, ResolvedProperty } from "../../types";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import {
    enumToObjectEntries,
    isEnumValueDisabled
} from "../../core/util/enums";
import { ArrayEnumPreview, EnumValuesChip } from "../../preview";
import { ErrorView, getIconForProperty } from "../../core";

/**
 * This fields renders a dropdown with multiple selection.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayEnumSelectBinding({
                                           propertyKey,
                                           value,
                                           setValue,
                                           error,
                                           showError,
                                           disabled,
                                           property,
                                           includeDescription,
                                           autoFocus
                                       }: FieldProps<EnumType[], any, any>) {

    const of = property.of;
    if (!of) {
        throw Error("Using wrong component ArrayEnumSelect");
    }

    if (Array.isArray(of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (of.dataType !== "string" && of.dataType !== "number") {
        throw Error("Field misconfiguration: array field of type string or number");
    }

    const enumValues = of.enumValues;
    if (!enumValues) {
        console.error(property);
        throw Error("Field misconfiguration: array field of type string or number needs to have enumValues");
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const handleClearClick = useCallback(() => {
        setValue(null);
    }, [setValue]);

    if (enumValues instanceof Error) {
        return <ErrorView error={enumValues.message}/>;
    }

    const validValue = !!value && Array.isArray(value);
    return (
        <FormControl
            fullWidth
            required={property.validation?.required}
            error={showError}
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

            <InputLabel id={`${propertyKey}-multiselect-label`}>
                <LabelWithIcon icon={getIconForProperty(property)}
                               title={property.name}/>
            </InputLabel>

            <MuiSelect
                multiple
                sx={(theme) => ({
                    minHeight: "64px",
                    borderRadius: `${theme.shape.borderRadius}px`
                })}
                variant={"filled"}
                labelId={`${propertyKey}-multiselect-label`}
                value={validValue ? value.map(v => v.toString()) : []}
                autoFocus={autoFocus}
                disabled={disabled}
                disableUnderline={true}
                endAdornment={
                    of.clearable && <IconButton
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
                    let newValue;
                    if ((of as ResolvedProperty)?.dataType === "number")
                        newValue = evt.target.value ? evt.target.value.map((e: any) => parseFloat(e)) : [];
                    else
                        newValue = evt.target.value;
                    return setValue(
                        newValue
                    );
                }}
                renderValue={(selected: any) => (
                    <ArrayEnumPreview value={selected}
                                      name={propertyKey}
                                      enumValues={enumValues}
                                      size={"regular"}/>
                )}>

                {enumToObjectEntries(enumValues)
                    .map((enumConfig) => {
                        const enumKey = enumConfig.id;
                        const checked = validValue && value.map(v => v.toString()).includes(enumKey.toString());
                        return (
                            <MenuItem
                                key={`form-select-${propertyKey}-${enumKey}`}
                                value={enumKey}
                                disabled={isEnumValueDisabled(enumConfig)}
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

            {showError && <FormHelperText error={true}>{error}</FormHelperText>}

        </FormControl>
    );
}
