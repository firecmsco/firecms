import React from "react";
import { FormControl, FormHelperText, Paper } from "@mui/material";

import { FieldProps } from "../../models";
import { formStyles } from "../styles";
import { PreviewComponent } from "../../preview";
import { FieldDescription } from "../../form";
import { LabelWithIcon } from "../components";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";

/**
 *
 * Simply render the non-editable preview of a field
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ReadOnlyField({
                                                                    name,
                                                                    value,
                                                                    setValue,
                                                                    error,
                                                                    showError,
                                                                    isSubmitting,
                                                                    touched,
                                                                    tableMode,
                                                                    property,
                                                                    includeDescription,
                                                                    context
                                                                }: FieldProps<any>) {

    const classes = formStyles();

    return (

        <FormControl fullWidth error={showError}>

            {!tableMode && <FormHelperText filled
                                           required={property.validation?.required}>
                <LabelWithIcon property={property}/>
            </FormHelperText>}

            <Paper
                className={`${classes.paper} ${classes.largePadding} ${classes.input}`}
                variant={"outlined"}>

                <ErrorBoundary>
                    <PreviewComponent name={name}
                                      value={value}
                                      property={property}
                                      size={"regular"}/>
                </ErrorBoundary>

            </Paper>

            {showError &&
            typeof error === "string" &&
            <FormHelperText>{error}</FormHelperText>}

            {includeDescription &&
            <FieldDescription property={property}/>}

        </FormControl>
    );
}
