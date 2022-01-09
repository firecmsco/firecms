import React from "react";
import {
    Box,
    FilledInput,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    Switch,
    Typography
} from "@mui/material";

import { FieldProps, MediaType, StringProperty } from "../../models";
import { PreviewComponent } from "../../preview";
import { FieldDescription } from "../../form";
import { LabelWithIcon } from "../components";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { useClearRestoreValue } from "../../hooks";
import { formStyles } from "../styles";

interface TextFieldProps<T extends string | number> extends FieldProps<T> {
    allowInfinity?: boolean
}

/**
 * Generic text field.
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function TextField<T extends string | number>({
                                                         name,
                                                         value,
                                                         setValue,
                                                         error,
                                                         showError,
                                                         disabled,
                                                         autoFocus,
                                                         property,
                                                         includeDescription,
                                                         allowInfinity,
                                                         shouldAlwaysRerender
                                                     }: TextFieldProps<T>) {

    let mediaType: MediaType | undefined;
    let multiline: boolean | undefined;
    if (property.dataType === "string") {
        const url = (property as StringProperty).url;
        mediaType = typeof url === "string" ? url : undefined;
        multiline = (property as StringProperty).multiline;
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const isMultiline = !!multiline;

    const internalValue = value ?? (property.dataType === "string" ? "" : value === 0 ? 0 : "");

    const valueIsInfinity = internalValue === Infinity;
    const inputType = !valueIsInfinity && property.dataType === "number" ? "number" : undefined;

    const updateValue = (newValue: typeof internalValue | undefined) => {

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
    };

    const filledInput = (
        <FilledInput
            sx={{
                minHeight: "64px"
            }}
            autoFocus={autoFocus}
            type={inputType}
            multiline={isMultiline}
            inputProps={{
                rows: 4
            }}
            value={valueIsInfinity ? "Infinity" : (value ?? "")}
            disabled={disabled}
            onChange={(evt) => {
                updateValue(evt.target.value as T);
            }}
        />
    );

    return (
        <>

            <FormControl
                variant="filled"
                required={property.validation?.required}
                error={showError}
                disabled={valueIsInfinity}
                sx={{
                    '& .MuiInputLabel-formControl': {
                        mt: 1 / 2,
                        ml: 1 / 2
                    },
                    '& .MuiInputLabel-shrink': {
                        mt: -1 / 4
                    }
                }}
                fullWidth>

                <InputLabel>
                    <LabelWithIcon property={property}/>
                </InputLabel>

                {filledInput}

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

            {mediaType && internalValue &&
            <ErrorBoundary>
                <Box m={1}>
                    <PreviewComponent name={name}
                                      value={internalValue}
                                      property={property}
                                      size={"regular"}/>
                </Box>
            </ErrorBoundary>
            }
        </>
    );

}
