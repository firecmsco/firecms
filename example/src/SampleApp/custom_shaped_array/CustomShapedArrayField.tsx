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
                                                   name,
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
                                               }: FieldProps<any[], CustomShapedArrayProps>)
    : ReactElement {

    const properties = customProps.properties;

    return (
        <FormControl fullWidth error={showError}>

            <FormHelperText>{property.title ?? name}</FormHelperText>

            <Paper variant={"outlined"}>
                <Box m={2}>
                    {properties.map((property, index) =>
                        <div key={`array_${index}`}>
                            {buildPropertyField({
                                name: `${name}[${index}]`,
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
