import React, { useEffect } from "react";
import { FormControl, FormHelperText, Paper } from "@mui/material";
import {
    buildProperty,
    FieldDescription,
    FieldProps,
    PropertyFieldBinding
} from "firecms";

/**
 * Simple map field to test validation of custom fields
 */
export const CustomField = ({
                         property,
                         value,
                         propertyKey,
                         tableMode,
                         error,
                         showError,
                         includeDescription,
                         context,
                         setValue
                     }: FieldProps<Record<string, any>>) => {
    useEffect(() => {
        if (!value) setValue({});
    }, [value, setValue]);

    const fieldProps = {
        propertyKey: `${propertyKey}.sample`,
        property: buildProperty({
            name: "Sample",
            dataType: "string",
            validation: {
                required: true
            }
        }),
        context
    };

    return (
        <FormControl fullWidth error={showError}>
            <Paper elevation={0}>
                <PropertyFieldBinding {...fieldProps}/>
            </Paper>

            {includeDescription && <FieldDescription property={property} />}

            {showError && typeof error === "string" && (
                <FormHelperText>{error}</FormHelperText>
            )}
        </FormControl>
    );
};
