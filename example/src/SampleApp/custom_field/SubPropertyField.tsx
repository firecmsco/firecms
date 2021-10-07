import React, { useEffect } from "react";
import { FormControl, FormHelperText, Paper } from "@mui/material";
import {
    buildPropertyField,
    FieldDescription,
    FieldProps,
    LabelWithIcon
} from "@camberi/firecms";

/**
 * Simple map field to test validation of custom fields
 */
export const CustomField = ({
                         property,
                         value,
                         name,
                         tableMode,
                         error,
                         showError,
                         includeDescription,
                         context,
                         setValue,
                     }: FieldProps<object>) => {
    useEffect(() => {
        if (!value) setValue({});
    }, [value, setValue]);

    return (
        <FormControl fullWidth error={showError}>
            {!tableMode && (
                <FormHelperText filled required={property.validation?.required}>
                    <LabelWithIcon property={property} />
                </FormHelperText>
            )}

            <Paper elevation={0}>
                {buildPropertyField({
                    name: `${name}.sample`,
                    property: {
                        title: "Sample",
                        dataType: "string",
                        validation: {
                            required: true,
                        },
                    },
                    context,
                })}
            </Paper>

            {includeDescription && <FieldDescription property={property} />}

            {showError && typeof error === "string" && (
                <FormHelperText>{error}</FormHelperText>
            )}
        </FormControl>
    );
};
