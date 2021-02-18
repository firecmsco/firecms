import { MediaType, StringProperty } from "../../models";
import {
    Box,
    FilledInput,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    Switch,
    Typography
} from "@material-ui/core";
import React from "react";

import { FieldProps } from "../../models/form_props";
import PreviewComponent from "../../preview/PreviewComponent";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import ErrorBoundary from "../../components/ErrorBoundary";
import { useClearRestoreValue } from "../useClearRestoreValue";

interface TextFieldProps extends FieldProps<string | number> {
    allowInfinity?: boolean
}

export default function TextField({
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
                                      dependsOnOtherProperties
                                  }: TextFieldProps) {

    let mediaType: MediaType | undefined;
    let multiline: boolean | undefined;
    if (property.dataType === "string") {
        const url = (property as StringProperty).config?.url;
        mediaType = typeof url === "string" ? url : undefined;
        multiline = (property as StringProperty).config?.multiline;
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
                numValue
            );
        } else {
            setValue(
                newValue
            );
        }
    };

    const filledInput = (
        <FilledInput
            autoFocus={autoFocus}
            type={inputType}
            multiline={isMultiline}
            inputProps={{
                rows: 4
            }}
            value={valueIsInfinity ? "Infinity" : (value ?? "")}
            disabled={disabled}
            onChange={(evt) => {
                updateValue(evt.target.value);
            }}
        />
    );

    return (
        <>

            <FormControl
                required={property.validation?.required}
                error={showError}
                disabled={valueIsInfinity}
                fullWidth>

                <InputLabel style={{
                    marginLeft: "8px",
                    marginTop: "4px"
                }}>
                    <LabelWithIcon property={property}/>
                </InputLabel>

                {filledInput}

                <Box display={"flex"}>

                    <Box flexGrow={1}>
                        {showError && <FormHelperText
                            id="component-error-text">{error}</FormHelperText>}

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
                                        evt.target.checked ? Infinity : undefined);
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
