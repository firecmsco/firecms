import React from "react";
import { FieldHelperText, FieldProps, PropertyFieldBinding, PropertyFieldBindingProps, } from "@firecms/core";
import { Paper, Typography } from "@firecms/ui";
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
        <>

            <Typography>{property.name ?? propertyKey}</Typography>

            <Paper>
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

        </>

    );

}
