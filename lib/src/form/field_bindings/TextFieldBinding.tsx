import React, { useCallback } from "react";
import {
    Box,
    FormControlLabel,
    FormHelperText,
    IconButton,
    Switch,
    Typography
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";

import { FieldProps } from "../../types";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { getIconForProperty } from "../../core";
import { TextInput } from "../../core/components/fields/TextInput";

interface TextFieldProps<T extends string | number> extends FieldProps<T> {
    allowInfinity?: boolean
}

/**
 * Generic text field.
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function TextFieldBinding<T extends string | number>({
                                                                propertyKey,
                                                                value,
                                                                setValue,
                                                                error,
                                                                showError,
                                                                disabled,
                                                                autoFocus,
                                                                property,
                                                                includeDescription,
                                                                allowInfinity
                                                            }: TextFieldProps<T>) {

    let multiline: boolean | undefined;
    if (property.dataType === "string") {
        multiline = property.multiline;
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const handleClearClick = useCallback(() => {
        setValue(null);
    }, [setValue]);

    const isMultiline = Boolean(multiline);

    const internalValue = value ?? (property.dataType === "string" ? "" : value === 0 ? 0 : "");

    const valueIsInfinity = internalValue === Infinity;
    const inputType = !valueIsInfinity && property.dataType === "number" ? "number" : undefined;

    const updateValue = useCallback((newValue: typeof internalValue | undefined) => {

        if (!newValue) {
            setValue(
                null
            );
        } else if (inputType === "number") {
            const numValue = parseFloat(newValue as string);
            setValue(
                numValue as T
            );
        } else {
            setValue(
                newValue
            );
        }
    }, [inputType, setValue]);

    return (
        <>
            <TextInput
                value={value}
                setValue={setValue}
                autoFocus={autoFocus}
                label={<LabelWithIcon icon={getIconForProperty(property)}
                                      title={property.name}/>}
                inputType={inputType}
                multiline={isMultiline}
                disabled={disabled}
                endAdornment={
                    property.clearable && <IconButton
                        onClick={handleClearClick}>
                        <ClearIcon/>
                    </IconButton>
                }
                error={showError ? error : undefined}/>

            {(showError || includeDescription || allowInfinity) &&
                <Box display={"flex"}
                     sx={{ marginLeft: "14px" }}
                >

                    <Box flexGrow={1}>
                        {showError && <FormHelperText error={true}>{error}</FormHelperText>}

                        {includeDescription &&
                            <FieldDescription property={property}/>}
                    </Box>

                    {allowInfinity &&
                        <FormControlLabel
                            checked={valueIsInfinity}
                            style={{ marginRight: 0 }}
                            labelPlacement={"start"}
                            control={
                                <Switch
                                    size={"small"}
                                    type={"checkbox"}
                                    onChange={(evt) => {
                                        updateValue(
                                            evt.target.checked ? Infinity as T : undefined);
                                    }}/>
                            }
                            disabled={disabled}
                            label={
                                <Typography variant={"caption"}>
                                    Set value to Infinity
                                </Typography>
                            }
                        />
                    }
                </Box>}

            {/*</FormControl>*/}
        </>
    );

}
