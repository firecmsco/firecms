import React, { ReactElement } from "react";
import { Box, FormControl, FormHelperText, Paper } from "@mui/material";
import {
    buildPropertyField,
    FieldDescription,
    FieldProps
} from "@camberi/firecms";
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
    : ReactElement {

    const properties = customProps.properties;

    return (
        <FormControl fullWidth error={showError}>

            <FormHelperText>{property.name ?? propertyKey}</FormHelperText>

            <Paper variant={"outlined"}>
                <Box m={2}>
                    {properties.map((property, index) =>
                        <div key={`array_${index}`}>
                            {buildPropertyField({
                                propertyKey: `${propertyKey}[${index}]`,
                                property,
                                context
                            })}
                        </div>
                    )}
                </Box>
            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError
            && typeof error === "string"
            && <FormHelperText>{error}</FormHelperText>}

        </FormControl>

    );

}
