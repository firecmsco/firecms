import { EntitySchema } from "../../models";
import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
    Paper
} from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";

import { CMSFieldProps } from "./form_props";

type MapFieldProps<S extends EntitySchema> = CMSFieldProps<object>;

export default function MapField<S extends EntitySchema>({
                                                             field,
                                                             form: { isSubmitting, errors, touched, setFieldValue },
                                                             property,
                                                             includeDescription,
                                                             createFormField
                                                         }: MapFieldProps<S>) {

    const classes = formStyles();

    const mapProperties = property.properties;
    const hasError = touched && property.validation?.required && !field.value;

    return (
        <FormControl fullWidth error={hasError}>

            <FormHelperText filled
                            required={property.validation?.required}>
                {property.title || field.name}
            </FormHelperText>

            <Paper elevation={0} variant={"outlined"} className={classes.paper}>
                <Box m={1}>
                    <Grid container spacing={1}>
                        {Object.entries(mapProperties).map(([entryKey, childProperty], index) => {
                                const fieldValue = field.value ? field.value[entryKey] : null;
                                return <Grid item xs={12}
                                             key={`map-${field.name}-${index}`}>
                                    {createFormField(`${field.name}[${entryKey}]`,
                                        childProperty,
                                        includeDescription)}
                                </Grid>;
                            }
                        )}
                    </Grid>
                </Box>
            </Paper>

            {includeDescription && property.description &&
            <FormHelperText>{property.description}</FormHelperText>
            }

        </FormControl>
    );
}
