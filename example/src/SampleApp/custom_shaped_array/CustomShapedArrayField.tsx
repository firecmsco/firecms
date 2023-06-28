import React from "react";
import { FormControl, FormHelperText, Paper } from "@mui/material";
import { FieldProps, PropertyFieldBinding, PropertyFieldBindingProps, FieldHelperText } from "firecms";
import { CustomShapedArrayProps } from "./CustomShapedArrayProps";

export default function CustomShapedArrayField({
                                                   property,
                                                   propertyKey,
                                                   value,
                                                   setValue,
                                                   customProps,
                                                   touched,
                                                   error,
                                                   isSubmitting,
                                                   showError,
                                                   includeDescription,
                                                   context,
                                                   ...props
                                               }: FieldProps<{ name: string, age: number }[], CustomShapedArrayProps>)
     {

    const properties = customProps.properties;

    return (
        <FormControl fullWidth error={showError}>

            <FormHelperText>{property.name ?? propertyKey}</FormHelperText>

            <Paper variant={"outlined"}>
                <div className="m-8">
                    {properties.map((property, index) => {
                            const fieldProps: PropertyFieldBindingProps<any> = {
                                propertyKey: `${propertyKey}[${index}]`,
                                property,
                                context
                            };
                            return (
                                <div key={`array_${index}`}>
                                    <PropertyFieldBinding {...fieldProps}/>
                                </div>
                            );
                        }
                    )}
                </div>
            </Paper>

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>

        </FormControl>

    );

}
