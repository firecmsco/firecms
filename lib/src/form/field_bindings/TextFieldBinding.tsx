import React, { useCallback } from "react";
import {
    Box,
    FilledInput,
    FormControl,
    FormControlLabel,
    FormHelperText,
    IconButton,
    InputLabel,
    Switch,
    Typography
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";

import { FieldProps } from "../../types";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { getIconForProperty } from "../../core";

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

            <FormControl
                variant="filled"
                error={showError}
                disabled={valueIsInfinity}
                sx={{
                    // "& .MuiInputLabel-formControl": {
                    //     mt: 1 / 2,
                    //     ml: 1 / 2
                    // },
                    "& .MuiInputLabel-shrink": {
                        mt: -1 / 4
                    }
                }}
                fullWidth>

                <InputLabel sx={{ top: "4px" }}>
                    <LabelWithIcon icon={getIconForProperty(property)}
                                   title={property.name}/>
                </InputLabel>

                <FilledInput
                    sx={(theme) => ({
                        minHeight: "64px",
                        borderRadius: `${theme.shape.borderRadius}px`
                    })}
                    autoFocus={autoFocus}
                    type={inputType}
                    multiline={isMultiline}
                    disableUnderline={true}
                    inputProps={{
                        rows: 4
                    }}
                    endAdornment={
                        property.clearable && <IconButton
                            sx={{
                                position: "absolute",
                                right: "16px"
                            }}
                            onClick={handleClearClick}>
                            <ClearIcon/>
                        </IconButton>
                    }
                    value={valueIsInfinity ? "Infinity" : (value ?? "")}
                    disabled={disabled}
                    onChange={(evt) => {
                        updateValue(evt.target.value as T);
                    }}
                />

                <Box display={"flex"}>

                    <Box flexGrow={1}>
                        {showError && <FormHelperText>{error}</FormHelperText>}

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
                </Box>

            </FormControl>
        </>
    );

}
