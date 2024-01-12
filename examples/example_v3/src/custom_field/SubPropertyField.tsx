import React, { useEffect } from "react";
import { FieldHelperText, FieldProps, Property, PropertyFieldBinding } from "firecms";
import { Paper } from "@firecms/ui";

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
        property: {
            name: "Sample",
            dataType: "string",
            validation: {
                required: true
            }
        } satisfies Property,
        context
    };

    return (
        <>
            <Paper>
                <PropertyFieldBinding {...fieldProps}/>
            </Paper>

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>

        </>
    );
};
